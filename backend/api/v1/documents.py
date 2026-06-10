from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.concurrency import run_in_threadpool
from core.config import settings
from ml_pipeline.engine import IntelligentDocumentProcessor
from api.dependencies import get_db
from database.repository import DocumentRepository
import aiofiles
import os
import uuid
import io
import pandas as pd

router = APIRouter()

# Load the ML engine directly into the API memory (Bypassing Celery/Redis)
print("Loading ML Models directly into FastAPI...")
ocr_engine = IntelligentDocumentProcessor()

def merge_page_data(existing_data: dict, new_page_data: dict) -> dict:
    merged = existing_data.copy()
    for key, val in new_page_data.items():
        if isinstance(val, dict):
            if key not in merged or not isinstance(merged[key], dict):
                merged[key] = val.copy()
            else:
                for sub_key, sub_val in val.items():
                    if isinstance(sub_val, list):
                        if sub_key not in merged[key] or not isinstance(merged[key][sub_key], list):
                            merged[key][sub_key] = sub_val.copy()
                        else:
                            merged[key][sub_key].extend(sub_val)
                    else:
                        merged[key][sub_key] = sub_val
        elif isinstance(val, list):
            if key not in merged or not isinstance(merged[key], list):
                merged[key] = val.copy()
            else:
                merged[key].extend(val)
        else:
            merged[key] = val
    return merged

def get_val(d: dict, keys: list, default="") -> str:
    if not isinstance(d, dict):
        return default
    for k in keys:
        if k in d:
            return str(d[k]) if d[k] is not None else default
        if k.lower() in d:
            return str(d[k.lower()]) if d[k.lower()] is not None else default
        if k.title() in d:
            return str(d[k.title()]) if d[k.title()] is not None else default
        if k.upper() in d:
            return str(d[k.upper()]) if d[k.upper()] is not None else default
        spaced_k = k.replace("_", " ")
        if spaced_k in d:
            return str(d[spaced_k]) if d[spaced_k] is not None else default
        if spaced_k.lower() in d:
            return str(d[spaced_k.lower()]) if d[spaced_k.lower()] is not None else default
        if spaced_k.title() in d:
            return str(d[spaced_k.title()]) if d[spaced_k.title()] is not None else default
        if spaced_k.upper() in d:
            return str(d[spaced_k.upper()]) if d[spaced_k.upper()] is not None else default
    return default


@router.post("/process")
async def upload_and_process_document(
    file: UploadFile = File(None),
    filename: str = None,
    page: int = 0,
    task_id: str = None,
    db = Depends(get_db)
):
    """
    Accepts an industrial scan page-by-page. For initial page (page=0), accepts a file upload.
    For subsequent pages, accepts filename to reuse the saved document path.
    Integrates results incrementally into MongoDB.
    """
    if not file and not filename:
        raise HTTPException(status_code=400, detail="Either file or filename must be provided.")

    if file:
        allowed_types = ["image/jpeg", "image/png", "application/pdf"]
        file_extension = file.filename.split(".")[-1].lower()
        
        # Verify content type or extension matches allowed files (more robust for browser variations)
        is_allowed = (
            file.content_type in allowed_types or 
            file_extension in ["pdf", "jpg", "jpeg", "png"]
        )
        if not is_allowed:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use JPG, PNG, or PDF.")

        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        # Save file
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
            
        filename_used = unique_filename
    else:
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Saved file {filename} not found on server.")
        filename_used = filename

    try:
        # Process the specific page
        result_payload = await run_in_threadpool(ocr_engine.process_document, file_path, page_num=page)
        
        # Enhanced debugging log
        print(f"DEBUG - Extracted page results payload: {result_payload}")
        
        if isinstance(result_payload, dict) and "error" in result_payload:
            # Dynamically set to 503 if Google is busy, else 500
            error_msg = result_payload['error']
            status = 503 if "503" in error_msg or "UNAVAILABLE" in error_msg else 500
            
            raise HTTPException(
                status_code=status, 
                detail=f"AI Extraction Pipeline Error: {error_msg}"
            )
            
        extracted_data = result_payload["extracted_data"]
        total_pages = result_payload["total_pages"]
        
        # Save to database (MongoDB) and manage page-by-page list if task_id is provided
        repo = DocumentRepository(db)
        if task_id:
            existing_doc = await repo.get_document(task_id)
            if existing_doc:
                existing_extracted = existing_doc.get("extracted_data", {}) or {}
                pages = existing_extracted.get("pages", []) or []
                while len(pages) <= page:
                    pages.append(None)
                pages[page] = extracted_data
                accumulated_data = {
                    "pages": pages,
                    "total_pages": total_pages,
                    "filename": filename_used
                }
                await repo.save_document(task_id, accumulated_data)
            else:
                accumulated_data = {
                    "pages": [extracted_data],
                    "total_pages": total_pages,
                    "filename": filename_used
                }
                await repo.save_document(task_id, accumulated_data)
        else:
            task_id = uuid.uuid4().hex
            accumulated_data = {
                "pages": [extracted_data],
                "total_pages": total_pages,
                "filename": filename_used
            }
            await repo.save_document(task_id, accumulated_data)
        
        return {
            "message": "Page processed successfully",
            "filename": filename_used,
            "task_id": task_id,
            "data": accumulated_data,
            "current_page": page,
            "total_pages": total_pages,
            "has_next_page": page < total_pages - 1
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed inside route: {str(e)}")

@router.get("/")
async def get_all_processed_documents(db = Depends(get_db)):
    """
    Retrieves all processed document records from the database.
    """
    try:
        repo = DocumentRepository(db)
        records = await repo.get_all_documents()
        return records
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve records: {str(e)}")

@router.get("/export")
async def export_all_data_to_excel(db = Depends(get_db)):
    """
    Aggregates all processed document records and converts them to a multi-sheet Excel file.
    Worksheets:
    1. Product Specifications
    2. Moulding & Consumption
    3. QA & Inspection Checks
    4. Consumable Materials
    5. Verification Signatures
    """
    try:
        repo = DocumentRepository(db)
        documents = await repo.get_all_documents()

        sheet1_rows = []
        sheet2_rows = []
        sheet3_rows = []
        sheet4_rows = []
        sheet5_rows = []

        def normalize_document(doc) -> list:
            task_id = doc.get("task_id", "N/A")
            data = doc.get("extracted_data", {}) or {}
            if not data:
                return []
                
            pages = []
            
            # 1. Structured/New multi-page format
            if "pages" in data:
                raw_pages = data.get("pages", []) or []
                for idx, page_data in enumerate(raw_pages):
                    if page_data is None:
                        continue
                    pages.append({
                        "task_id": task_id,
                        "page_no": f"Page {idx+1}",
                        "metadata": page_data.get("document_metadata", {}) or {},
                        "product_details": page_data.get("product_details", {}) or {},
                        "moulding_details": page_data.get("moulding_details", {}) or {},
                        "inspection_parameters": page_data.get("inspection_parameters", {}) or {},
                        "refractory_and_sand": page_data.get("refractory_sleeve_and_sand_consumption", {}) or {},
                        "materials_table": page_data.get("materials_table", []) or [],
                        "signatures": page_data.get("signatures", {}) or {},
                        "qa_parameters": page_data.get("qa_parameters", []) or []
                    })
                    
            # 2. Legacy Queue Pages format (Original / 6-Page schemas)
            elif "queue_pages" in data:
                raw_pages = data.get("queue_pages", []) or []
                for idx, page in enumerate(raw_pages):
                    prod = page.get("production_plan", {}) or {}
                    qa = page.get("qa_parameters", {}) or {}
                    pour = page.get("pouring_details", {}) or {}
                    
                    pages.append({
                        "task_id": task_id,
                        "page_no": page.get("page_number") or f"Page {idx+1}",
                        "metadata": {
                            "heat_no": prod.get("heat_no", ""),
                            "planning_date": prod.get("planning_date", ""),
                            "pouring_date": prod.get("pouring_date", ""),
                        },
                        "product_details": {
                            "customer": prod.get("customer", ""),
                            "grade": prod.get("grade", ""),
                            "casting_weight": prod.get("casting_weight", ""),
                            "liquid_weight": pour.get("pouring_weight", ""),
                        },
                        "moulding_details": {
                            "top": {"moulding_time": pour.get("pouring_time", "")}
                        },
                        "inspection_parameters": {
                            "mould_checking": qa.get("hardness_mould", ""),
                            "sleeve_size_oven": qa.get("hardness_core", "")
                        },
                        "refractory_and_sand": {},
                        "materials_table": [],
                        "signatures": {},
                        "qa_parameters": [f"Mould Hardness: {qa.get('hardness_mould', '')}", f"Core Hardness: {qa.get('hardness_core', '')}"]
                    })
                    
            # 3. Dynamic schema / Single page formats
            else:
                metadata = data.get("document_metadata", {}) or {}
                prod = data.get("product_details", {}) or {}
                pour = data.get("pouring_details", {}) or {}
                inspect = data.get("inspection_parameters", {}) or {}
                signatures = data.get("signatures", {}) or {}
                
                # Consumables / Sleeves / Batch Summary
                materials = []
                if "materials_table" in data:
                    raw_mats = data.get("materials_table", []) or []
                    for row in raw_mats:
                        materials.append({
                            "sle_code": row.get("sle_code", ""),
                            "sle_name": row.get("sle_name", ""),
                            "slv_qty": row.get("slv_qty", ""),
                            "actual_qty": row.get("actual_qty", "")
                        })
                elif "tables" in data and "batch_summary" in data.get("tables", {}):
                    for row in data.get("tables", {}).get("batch_summary", []):
                        materials.append({
                            "sle_code": row.get("material_code", ""),
                            "sle_name": row.get("material_description", ""),
                            "slv_qty": row.get("t_qty", ""),
                            "actual_qty": row.get("batch_no", "")
                        })
                elif "batch_summary" in data:
                    for row in data.get("batch_summary", []):
                        materials.append({
                            "sle_code": row.get("material_code", ""),
                            "sle_name": row.get("material_description", ""),
                            "slv_qty": row.get("t_qty", ""),
                            "actual_qty": row.get("batch_no", "")
                        })
                        
                pages.append({
                    "task_id": task_id,
                    "page_no": "Page 1",
                    "metadata": metadata,
                    "product_details": prod,
                    "moulding_details": data.get("moulding_details", {}) or {},
                    "inspection_parameters": inspect,
                    "refractory_and_sand": data.get("refractory_sleeve_and_sand_consumption", {}) or {},
                    "materials_table": materials,
                    "signatures": signatures,
                    "qa_parameters": data.get("qa_parameters", []) or []
                })
                
            return pages

        for doc in documents:
            pages = normalize_document(doc)
            for page in pages:
                # --- SHEET 1: Product Specifications ---
                m = page["metadata"]
                p = page["product_details"]
                
                sheet1_rows.append({
                    "Task ID": page["task_id"],
                    "Page No": page["page_no"],
                    "Form ID": get_val(m, ["form_id", "form id"]),
                    "Planning Date": get_val(m, ["planning_date", "planning date", "date"]),
                    "Pouring Date": get_val(m, ["pouring_date", "pouring date"]),
                    "Heat No": get_val(m, ["heat_no", "heat no"]),
                    "Customer": get_val(p, ["customer"]),
                    "Description": get_val(p, ["description"]),
                    "Grade": get_val(p, ["grade"]),
                    "Casting Weight (kg)": get_val(p, ["casting_weight", "casting weight"]),
                    "Liquid Weight (kg)": get_val(p, ["liquid_weight", "liquid weight"]),
                    "Qty": get_val(p, ["qty", "quantity"]),
                    "Sample / Bulk": get_val(p, ["sample_bulk", "sample/bulk"]),
                    "Finish Type": get_val(p, ["finish_type", "finish type"]),
                    "Pattern Code": get_val(p, ["pattern_code", "pattern code"]),
                    "Pattern Serial No": get_val(p, ["pattern_serial_no", "pattern serial no"]),
                    "Pattern Type": get_val(p, ["pattern_type", "pattern type"]),
                    "Drawing Number": get_val(p, ["drawing_number", "drawing number"]),
                    "Part No": get_val(p, ["part_no", "part no"]),
                    "Pcs in Box": get_val(p, ["pcs_in_box", "pcs in box"]),
                    "No of Core Boxes": get_val(p, ["no_of_core_boxes", "no of core boxes"]),
                    "No of Cores": get_val(p, ["no_of_cores", "no of cores"]),
                    "Method Remarks": get_val(p, ["method_remarks", "method remarks"])
                })

                # --- SHEET 2: Moulding & Consumption ---
                md = page["moulding_details"] or {}
                rc = page["refractory_and_sand"] or {}
                notes = get_val(rc, ["notes"])
                
                has_top_bottom = ("top" in md or "bottom" in md or "top" in rc or "bottom" in rc)
                if has_top_bottom:
                    for part in ["top", "bottom"]:
                        part_md = md.get(part, {}) or {}
                        part_rc = rc.get(part, {}) or {}
                        
                        sheet2_rows.append({
                            "Task ID": page["task_id"],
                            "Page No": page["page_no"],
                            "Heat No": get_val(m, ["heat_no", "heat no"]),
                            "Part (Top/Bottom)": part.upper(),
                            "Contractor": get_val(part_md, ["contractor"]),
                            "Moulder": get_val(part_md, ["moulder"]),
                            "Moulding Date": get_val(part_md, ["moulding_date", "moulding date"]),
                            "Moulding Time": get_val(part_md, ["moulding_time", "moulding time"]),
                            "Coating Details": get_val(part_md, ["coating_details", "coating details"]),
                            "Coating Date": get_val(part_md, ["coating_date", "coating date"]),
                            "Coating Time": get_val(part_md, ["coating_time", "coating time"]),
                            "Chromite Sand (kg)": get_val(part_rc, ["chromite_sand", "chromite sand"]),
                            "Silica Sand (kg)": get_val(part_rc, ["silica_sand", "silica sand"]),
                            "Sinotherm Resin (kg)": get_val(part_rc, ["sinotherm", "resin"]),
                            "Activator (kg)": get_val(part_rc, ["activator"]),
                            "Sparklex 100A Isomol (kg)": get_val(part_rc, ["sparklex_100a_isomol", "sparklex_100a_isomol (kg)", "sparklex"]),
                            "Process Notes": notes
                        })
                else:
                    sheet2_rows.append({
                        "Task ID": page["task_id"],
                        "Page No": page["page_no"],
                        "Heat No": get_val(m, ["heat_no", "heat no"]),
                        "Part (Top/Bottom)": "GENERAL/FLAT",
                        "Contractor": get_val(md, ["contractor"]),
                        "Moulder": get_val(md, ["moulder"]),
                        "Moulding Date": get_val(md, ["moulding_date", "moulding date"]),
                        "Moulding Time": get_val(md, ["moulding_time", "moulding time"]),
                        "Coating Details": get_val(md, ["coating_details", "coating details"]),
                        "Coating Date": get_val(md, ["coating_date", "coating date"]),
                        "Coating Time": get_val(md, ["coating_time", "coating time"]),
                        "Chromite Sand (kg)": get_val(rc, ["chromite_sand", "chromite sand"]),
                        "Silica Sand (kg)": get_val(rc, ["silica_sand", "silica sand"]),
                        "Sinotherm Resin (kg)": get_val(rc, ["sinotherm", "resin"]),
                        "Activator (kg)": get_val(rc, ["activator"]),
                        "Sparklex 100A Isomol (kg)": get_val(rc, ["sparklex_100a_isomol", "sparklex_100a_isomol (kg)", "sparklex"]),
                        "Process Notes": notes
                    })

                # --- SHEET 3: QA & Inspection Checks ---
                ip = page["inspection_parameters"] or {}
                qa_list = page["qa_parameters"] or []
                if isinstance(qa_list, list):
                    qa_summary = "; ".join([str(item) for item in qa_list if item])
                else:
                    qa_summary = str(qa_list)
                    
                sheet3_rows.append({
                    "Task ID": page["task_id"],
                    "Page No": page["page_no"],
                    "Heat No": get_val(m, ["heat_no", "heat no"]),
                    "Process Type": get_val(ip, ["process", "process type", "Pattern Finishing Process"]),
                    "Pattern Finishing": get_val(ip, ["pattern_finishing", "pattern finishing"]),
                    "Chill Size / Thickness": get_val(ip, ["chill_size_thickness", "chill size thickness"]),
                    "Chill Slot Blasted": get_val(ip, ["chill_slot_blasted", "chill slot blasted"]),
                    "Chill Finishing": get_val(ip, ["chill_finishing", "chill finishing"]),
                    "Sleeve Size Oven": get_val(ip, ["sleeve_size_oven", "sleeve size oven"]),
                    "Refractory Sleeve Check": get_val(ip, ["refactory_sleeve", "refractory sleeve", "refactory sleeve check"]),
                    "Lettering Checking": get_val(ip, ["lettering_checking", "lettering checking"]),
                    "Mould Checking": get_val(ip, ["mould_checking", "mould checking"]),
                    "QA Requirements Summary": qa_summary
                })

                # --- SHEET 4: Consumable Materials ---
                raw_mats = page["materials_table"] or []
                materials = []
                if isinstance(raw_mats, list):
                    for row in raw_mats:
                        code = get_val(row, ["sle_code", "code"])
                        desc = get_val(row, ["sle_name", "description", "item"])
                        qty = get_val(row, ["slv_qty", "qty", "quantity"])
                        act = get_val(row, ["actual_qty", "batch_no"])
                        if not code and not desc and not qty:
                            continue
                        materials.append({
                            "code": code,
                            "desc": desc,
                            "qty": qty,
                            "act": act
                        })
                for mat in materials:
                    sheet4_rows.append({
                        "Task ID": page["task_id"],
                        "Page No": page["page_no"],
                        "Heat No": get_val(m, ["heat_no", "heat no"]),
                        "Material/Sleeve Code": mat["code"],
                        "Description": mat["desc"],
                        "Quantity": mat["qty"],
                        "Actual Quantity / Batch No": mat["act"]
                    })

                # --- SHEET 5: Verification Signatures ---
                sig = page["signatures"] or {}
                sheet5_rows.append({
                    "Task ID": page["task_id"],
                    "Page No": page["page_no"],
                    "Heat No": get_val(m, ["heat_no", "heat no"]),
                    "Planned By": get_val(sig, ["planned_by", "Planned By"]),
                    "Pattern Inspected By": get_val(sig, ["pattern_inspected_by", "Pattern Inspected By"]),
                    "QA Checked By": get_val(sig, ["qa_checked_by", "QA Checked By"]),
                    "Core Inspected By": get_val(sig, ["core_inspected_by", "Core Inspected By"]),
                    "Mould Inspected By": get_val(sig, ["mould_inspected_by", "Mould Inspected By"]),
                    "Closing Inspected By": get_val(sig, ["closing_inspected_by", "Closing Inspected By"]),
                    "Pouring Inspected By": get_val(sig, ["pouring_inspected_by", "Pouring Inspected By"]),
                    "Pre Production Inspected By": get_val(sig, ["pre_production_inspected_by", "Pre Production Inspected By"])
                })

        # Convert to Pandas DataFrames
        df_sheet1 = pd.DataFrame(sheet1_rows) if sheet1_rows else pd.DataFrame(columns=["Task ID", "Page No", "Heat No", "Customer", "Grade"])
        df_sheet2 = pd.DataFrame(sheet2_rows) if sheet2_rows else pd.DataFrame(columns=["Task ID", "Page No", "Heat No", "Part (Top/Bottom)", "Moulder"])
        df_sheet3 = pd.DataFrame(sheet3_rows) if sheet3_rows else pd.DataFrame(columns=["Task ID", "Page No", "Heat No", "Process Type", "QA Requirements Summary"])
        df_sheet4 = pd.DataFrame(sheet4_rows) if sheet4_rows else pd.DataFrame(columns=["Task ID", "Page No", "Heat No", "Material/Sleeve Code", "Description", "Quantity"])
        df_sheet5 = pd.DataFrame(sheet5_rows) if sheet5_rows else pd.DataFrame(columns=["Task ID", "Page No", "Heat No", "Planned By", "Mould Inspected By"])

        # Write to memory buffer
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df_sheet1.to_excel(writer, index=False, sheet_name='Product Specifications')
            df_sheet2.to_excel(writer, index=False, sheet_name='Moulding & Consumption')
            df_sheet3.to_excel(writer, index=False, sheet_name='QA & Inspection Checks')
            df_sheet4.to_excel(writer, index=False, sheet_name='Consumable Materials')
            df_sheet5.to_excel(writer, index=False, sheet_name='Verification Signatures')
            
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=manufacturing_records.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export data: {str(e)}")

@router.get("/status/{task_id}")
async def get_processing_status(task_id: str):
    return {"task_id": task_id, "status": "SYNC_MODE_ACTIVE", "message": "Redis is disabled. Check the main /process route for output."}