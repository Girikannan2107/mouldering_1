from pydantic import BaseModel
from typing import List, Optional

class DocumentMetadata(BaseModel):
    form_id: Optional[str] = None
    planning_date: Optional[str] = None
    heat_no: Optional[str] = None
    pouring_date: Optional[str] = None

class ProductDetails(BaseModel):
    description: Optional[str] = None
    customer: Optional[str] = None
    grade: Optional[str] = None
    casting_weight: Optional[str] = None
    liquid_weight: Optional[str] = None
    qty: Optional[str] = None
    sample_bulk: Optional[str] = None
    finish_type: Optional[str] = None
    pattern_code: Optional[str] = None
    pattern_serial_no: Optional[str] = None
    pattern_type: Optional[str] = None
    drawing_number: Optional[str] = None
    part_no: Optional[str] = None
    pcs_in_box: Optional[str] = None
    no_of_core_boxes: Optional[str] = None
    no_of_cores: Optional[str] = None
    method_remarks: Optional[str] = None

class MouldingRow(BaseModel):
    contractor: Optional[str] = None
    moulder: Optional[str] = None
    moulding_date: Optional[str] = None
    moulding_time: Optional[str] = None
    coating_details: Optional[str] = None
    coating_date: Optional[str] = None
    coating_time: Optional[str] = None

class MouldingDetails(BaseModel):
    top: Optional[MouldingRow] = None
    bottom: Optional[MouldingRow] = None

class InspectionParameters(BaseModel):
    pattern_finishing: Optional[str] = None
    process: Optional[str] = None
    chill_size_thickness: Optional[str] = None
    chill_slot_blasted: Optional[str] = None
    chill_finishing: Optional[str] = None
    sleeve_size_oven: Optional[str] = None
    refactory_sleeve: Optional[str] = None
    lettering_checking: Optional[str] = None
    mould_checking: Optional[str] = None

class SandConsumptionRow(BaseModel):
    chromite_sand: Optional[str] = None
    silica_sand: Optional[str] = None
    sinotherm: Optional[str] = None
    activator: Optional[str] = None
    sparklex_100a_isomol: Optional[str] = None

class RefractorySleeveAndSandConsumption(BaseModel):
    notes: Optional[str] = None
    top: Optional[SandConsumptionRow] = None
    bottom: Optional[SandConsumptionRow] = None

class MaterialsTableItem(BaseModel):
    sle_code: Optional[str] = None
    sle_name: Optional[str] = None
    slv_qty: Optional[str] = None
    actual_qty: Optional[str] = None

class BottomSignatures(BaseModel):
    planned_by: Optional[str] = None
    pattern_inspected_by: Optional[str] = None
    qa_checked_by: Optional[str] = None
    core_inspected_by: Optional[str] = None
    mould_inspected_by: Optional[str] = None
    closing_inspected_by: Optional[str] = None
    pouring_inspected_by: Optional[str] = None
    pre_production_inspected_by: Optional[str] = None

class ProductionPlanDocument(BaseModel):
    document_metadata: Optional[DocumentMetadata] = None
    product_details: Optional[ProductDetails] = None
    qa_parameters: Optional[List[str]] = []
    moulding_details: Optional[MouldingDetails] = None
    inspection_parameters: Optional[InspectionParameters] = None
    refractory_sleeve_and_sand_consumption: Optional[RefractorySleeveAndSandConsumption] = None
    materials_table: Optional[List[MaterialsTableItem]] = []
    signatures: Optional[BottomSignatures] = None

class DocumentExtractionResult(BaseModel):
    production_plans: List[ProductionPlanDocument]