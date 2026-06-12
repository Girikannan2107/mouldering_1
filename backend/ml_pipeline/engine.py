import fitz  # PyMuPDF
import base64
import json
import time
import os
import mimetypes
import requests
from dotenv import load_dotenv
from ml_pipeline.key_manager import key_manager

class IntelligentDocumentProcessor:
    def __init__(self):
        pass

    def process_document(self, file_path: str, page_num: int = None) -> dict:
        if not key_manager.get_api_key():    
            return {"error": "Missing GEMINI_API_KEY. Please set the environment variable.", "total_pages": 0}

        print(f"1. Reading Document: {file_path}")
        parts = []
        total_pages = 0

        # Determine if the file is a PDF or an Image
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            ext = file_path.lower().split('.')[-1]
            if ext == 'pdf':
                mime_type = 'application/pdf'
            elif ext in ['jpg', 'jpeg']:
                mime_type = 'image/jpeg'
            elif ext == 'png':
                mime_type = 'image/png'
        
        try:
            if mime_type == 'application/pdf':
                doc = fitz.open(file_path)
                total_pages = len(doc)
                print(f"2. PDF has {total_pages} pages. Target page: {page_num}")
                
                pages_to_process = range(total_pages) if page_num is None else [page_num]
                
                for p_idx in pages_to_process:
                    if p_idx < 0 or p_idx >= total_pages:
                        doc.close()
                        return {"error": f"Page number {p_idx} is out of bounds (total pages: {total_pages})", "total_pages": total_pages}
                    
                    page = doc.load_page(p_idx)
                    pix = page.get_pixmap(dpi=100)
                    img_data = pix.tobytes("jpeg")
                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                    
                    parts.append({
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": img_base64
                        }
                    })
                doc.close()
                
            elif mime_type in ['image/jpeg', 'image/png']:
                total_pages = 1
                if page_num is not None and page_num != 0:
                    return {"error": f"Page number {page_num} is out of bounds for an image (total pages: 1)", "total_pages": 1}
                print("2. Encoding single image for Gemini Vision...")
                with open(file_path, "rb") as image_file:
                    img_data = image_file.read()
                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                    
                    parts.append({
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": img_base64
                        }
                    })
            else:
                 return {"error": f"Unsupported file type: {mime_type}. Please upload PDF, JPG, or PNG.", "total_pages": 0}

        except Exception as e:
            return {"error": f"Failed to process file: {str(e)}", "total_pages": 0}

        # --- THE EXHAUSTIVE PROMPT ---
        prompt = """Extract all printed and handwritten data from this Foundry Production Plan / Moulding cycle log document. 
Handwritten values next to a field or written over a printed value take priority. Ignore crossed-out items. Preserve units.
Return strictly valid JSON matching this exact structure:

{
  "document_metadata": {
    "form_id": "Extract Form ID (e.g. 'UA/F/PP/01')",
    "planning_date": "Extract Planning Date",
    "heat_no": "Extract Heat No (e.g. 'B23722-01')",
    "pouring_date": "Extract Pouring Date"
  },
  "product_details": {
    "description": "Extract Description",
    "customer": "Extract Customer Name",
    "grade": "Extract Grade",
    "casting_weight": "Extract Casting Weight",
    "liquid_weight": "Extract Liquid Weight",
    "qty": "Extract Qty",
    "sample_bulk": "Extract Sample / Bulk",
    "finish_type": "Extract Finish Type",
    "pattern_code": "Extract Pattern Code",
    "pattern_serial_no": "Extract Pattern Serial No",
    "pattern_type": "Extract Pattern Type",
    "drawing_number": "Extract Drawing Number",
    "part_no": "Extract Part No",
    "pcs_in_box": "Extract Pcs In Box",
    "no_of_core_boxes": "Extract No of Core Boxes",
    "no_of_cores": "Extract No of Cores",
    "method_remarks": "Extract Method Remarks"
  },
  "qa_parameters": [
    "List of all QA parameter requirements printed/written in the center column as strings"
  ],
  "moulding_details": {
    "top": {
      "contractor": "Contractor top value",
      "moulder": "Moulder top value",
      "moulding_date": "Date top value (Moulding row)",
      "moulding_time": "Time top value (Moulding row)",
      "coating_details": "Coating Details top value",
      "coating_date": "Date top value (second row under Coating Details)",
      "coating_time": "Time top value (second row under Coating Details)"
    },
    "bottom": {
      "contractor": "Contractor bottom value",
      "moulder": "Moulder bottom value",
      "moulding_date": "Date bottom value (Moulding row)",
      "moulding_time": "Time bottom value (Moulding row)",
      "coating_details": "Coating Details bottom value",
      "coating_date": "Date bottom value (second row under Coating Details)",
      "coating_time": "Time bottom value (second row under Coating Details)"
    }
  },
  "inspection_parameters": {
    "pattern_finishing": "Pattern Finishing check value",
    "process": "Process check value (e.g. 'CO2/Noback')",
    "chill_size_thickness": "Chill Size & Thickness check value",
    "chill_slot_blasted": "Chill Slot blasted check value",
    "chill_finishing": "Chill Finishing check value",
    "sleeve_size_oven": "Sleeve Size & Oven check value",
    "refactory_sleeve": "Refactory Sleeve check value",
    "lettering_checking": "Lettering Checking check value",
    "mould_checking": "Mould Checking check value"
  },
  "refractory_sleeve_and_sand_consumption": {
    "notes": "Any handwritten notes around this area (e.g. 'LP - 2NO', 'No bake Process', 'Ivp Resin & Activator')",
    "top": {
      "chromite_sand": "Chromite Sand top value",
      "silica_sand": "Silica Sand top value",
      "sinotherm": "Sinotherm top value",
      "activator": "Activator top value",
      "sparklex_100a_isomol": "Sparklex 100A Isomol top value"
    },
    "bottom": {
      "chromite_sand": "Chromite Sand bottom value",
      "silica_sand": "Silica Sand bottom value",
      "sinotherm": "Sinotherm bottom value",
      "activator": "Activator bottom value",
      "sparklex_100a_isomol": "Sparklex 100A Isomol bottom value"
    }
  },
  "materials_table": [
    {
      "sle_code": "Sleeve/Material Code (e.g. '200142')",
      "sle_name": "Sleeve/Material Name (e.g. 'GAS - CARBON - DI -OXIDE')",
      "slv_qty": "Sleeve/Material Planned Qty (e.g. '1.000')",
      "actual_qty": "Handwritten actual qty next to the row, if any (e.g. '0.858')"
    }
  ],
  "signatures": {
    "planned_by": "Planned By signature status",
    "pattern_inspected_by": "Pattern Parameters Checked & Pattern Condition Inspected By signature status",
    "qa_checked_by": "QA Parameters Checked By signature status",
    "core_inspected_by": "Core Inspected By signature status",
    "mould_inspected_by": "Mould Inspected By signature status",
    "closing_inspected_by": "Closing Inspected By signature status",
    "pouring_inspected_by": "Pouring Inspected By signature status",
    "pre_production_inspected_by": "Pre Production Inspected By signature status"
  }
}"""
        
        # Make sure the prompt text is the very first item in the parts array
        parts.insert(0, {"text": prompt})

        print("3. Sending page payload to Gemini API...")
        max_key_attempts = 5
        response = None
        
        for key_attempt in range(max_key_attempts):
            current_key = key_manager.get_api_key()
            if not current_key:
                return {"error": "Missing GEMINI_API_KEY. Please set the environment variable.", "total_pages": total_pages}
                
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={current_key}"
            
            payload = {
                "contents": [{"parts": parts}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.1 
                }
            }
            headers = {"Content-Type": "application/json"}
            
            try:
                # Inner retry logic for Google transient errors (503)
                max_retries = 3
                for attempt in range(max_retries):
                    response = requests.post(url, headers=headers, json=payload)
                    
                    # If Google is busy (503), wait 5 seconds and try again
                    if response.status_code == 503:
                        print(f"[WARNING] Google servers busy (503). Retrying in 5 seconds... (Attempt {attempt + 1} of {max_retries})")
                        time.sleep(5)
                        if attempt == max_retries - 1:
                            break
                        continue 
                    break
                
                # Check for rate limit, quota exhaustion or access error
                is_exhausted = (
                    response is not None and (
                        response.status_code == 429 or
                        (response.status_code in [400, 403] and any(term in response.text.lower() for term in ["quota", "limit", "exhausted", "key"]))
                    )
                )
                
                if is_exhausted:
                    print(f"[WARNING] API key exhausted or rate-limited. Switching to next key. (Attempt {key_attempt + 1}/{max_key_attempts})")
                    key_manager.handle_exhaustion(current_key)
                    continue
                    
                if response is not None and response.status_code != 200:
                    print("Status:", response.status_code)
                    print("Response:", response.text)
                    key_manager.handle_exhaustion(current_key)
                    continue
                    
                # Success - break outer loop
                break
                
            except requests.exceptions.RequestException as req_err:
                 print(f"API Request Failed on key attempt {key_attempt + 1}: {req_err}")
                 if req_err.response is not None:
                     print(f"Response Content: {req_err.response.text}")
                 key_manager.handle_exhaustion(current_key)
                 continue
                 
        try:
            if response is None or response.status_code != 200:
                err_msg = response.text if response is not None else "All API keys failed or were exhausted."
                return {"error": f"API Error: {err_msg}", "total_pages": total_pages}
                
            # Parse successful response
            result = response.json()
            ai_text_response = result['candidates'][0]['content']['parts'][0]['text'].strip()
            
            if ai_text_response.startswith("```"):
                ai_text_response = ai_text_response.lstrip("`").replace("json", "", 1).strip()
                if ai_text_response.endswith("```"):
                    ai_text_response = ai_text_response.rstrip("`").strip()
            
            return {
                "extracted_data": json.loads(ai_text_response),
                "total_pages": total_pages
            }
        except Exception as e:
            return {"error": str(e), "total_pages": total_pages}