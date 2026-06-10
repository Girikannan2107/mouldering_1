import os
import json
import requests
from ml_pipeline.key_manager import key_manager

class FieldMapper:
    def __init__(self):
        pass

    def _flatten_ocr_data(self, raw_data: dict) -> str:
        """Converts the raw OCR bounding box data into a readable text dump."""
        header_text = [item.get('text', '') for item in raw_data.get("header_raw", []) if isinstance(item, dict)]
        
        table_text = []
        for row in raw_data.get("table_rows", []):
            if isinstance(row, list):
                cleaned_row = [str(cell).strip() for cell in row if str(cell).strip()]
                table_text.append(" | ".join(cleaned_row))
                
        footer_text = raw_data.get("footer_notes", [])

        return (
            "--- HEADER OCR ---\n" + "\n".join(header_text) + "\n\n"
            "--- TABLE OCR ---\n" + "\n".join(table_text) + "\n\n"
            "--- FOOTER OCR ---\n" + "\n".join(footer_text)
        )

    def map_fields(self, raw_data: dict) -> dict:
        print("Passing OCR text to Gemini AI via REST API for Semantic Mapping...")
        
        combined_ocr_text = self._flatten_ocr_data(raw_data)
        
        prompt = f"""
        You are an elite Industrial Data Extraction AI. 
        I am providing you with the raw, imperfect OCR text from a Ladle Pouring Record.
        
        Your task is to semantically analyze the text, correct any obvious OCR typos (e.g., 'Laddie' -> 'Ladle', 'Tem Pexqture' -> 'Temperature'), and map the values to the exact JSON schema provided. 
        Use your intelligence to align the columns properly. For example, if you see 'WCB', that is the Grade. If you see 'Geco Special Machiners', that is the Customer.
        
        RAW OCR TEXT:
        {combined_ocr_text}
        
        OUTPUT SCHEMA INSTRUCTIONS:
        You MUST return ONLY a valid JSON object matching this exact structure. Do not invent data. If a field is missing, use an empty string "".
        
        {{
          "document_info": {{
            "date": "Extract the document date",
            "heat_no": "Extract the Heat Number (e.g., A09600)",
            "ladle_capacity": "Extract ladle capacity (e.g., '3 Ton')"
          }},
          "pouring_details": {{
            "excess_metal_ingot_kg": "Extract excess metal ingot as a number (e.g., 240.0)",
            "pouring_temperatures": ["Array of pouring temperatures, e.g., '1534°C'"],
            "ladle_temperature": "Extract ladle temperature, e.g., '786°C'"
          }},
          "table_data": [
            {{
              "date": "Row Date (if any)",
              "heat_no": "Row Heat No (e.g., A09600-01)",
              "item": "Item description (e.g., BEARING HOUSING, TC-3000)",
              "grade": "Material grade (e.g., WCB)",
              "customer": "Customer Name",
              "planned_pouring_weight": "Planned weight",
              "pouring_time_planned": "Planned time",
              "ladle_number": "Ladle No",
              "tapping_sequence": "Tapping sequence number",
              "pouring_sequence": "Pouring sequence number",
              "pouring_time_sec": "Pouring time in seconds",
              "metal_weight_before_kg": "Weight before pouring",
              "metal_weight_after_kg": "Weight after pouring",
              "kno_weight": "Kno weight",
              "actual_liquid_poured_kg": "Actual liquid poured",
              "weight_diff": "Difference in weight",
              "pouring_observation": "Remarks or observations",
              "weight_before_cutting": "Weight before cutting"
            }}
          ]
        }}
        
        RULES:
        1. Ignore table headers (e.g., do not make a row where customer="Customer" or item="Item").
        2. Ensure data aligns correctly. Do not put numbers in the Customer field unless it is an actual numbered customer code.
        """

        # Fallback dictionary if API fails
        fallback_data = {
            "document_info": {}, "pouring_details": {}, "table_data": [], 
            "error": "AI Inference failed.", "raw_text_dump": combined_ocr_text
        }

        max_key_attempts = 5
        response = None
        
        for key_attempt in range(max_key_attempts):
            current_key = key_manager.get_api_key()
            if not current_key:
                fallback_data["error"] = "Missing GEMINI_API_KEY"
                return fallback_data
                
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={current_key}"
            headers = {'Content-Type': 'application/json'}
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            
            try:
                response = requests.post(url, headers=headers, json=payload)
                
                # Check for rate limit or exhaustion
                is_exhausted = (
                    response is not None and (
                        response.status_code == 429 or
                        (response.status_code in [400, 403] and any(term in response.text.lower() for term in ["quota", "limit", "exhausted", "key"]))
                    )
                )
                
                if is_exhausted:
                    print(f"[WARNING] API key exhausted/rate limited. Switching to next key. (Attempt {key_attempt + 1}/{max_key_attempts})")
                    key_manager.handle_exhaustion(current_key)
                    continue
                    
                response.raise_for_status()
                
                # Success - break outer loop
                break
                
            except Exception as e:
                print(f"AI Mapping Error on attempt {key_attempt + 1}: {e}")
                if 'response' in locals() and response is not None:
                    print(f"API Response: {response.text}")
                key_manager.handle_exhaustion(current_key)
                continue
                
        try:
            if response is None or response.status_code != 200:
                fallback_data["error"] = "All API keys failed or were exhausted."
                return fallback_data
                
            # Parse the Gemini JSON response
            result = response.json()
            ai_text_response = result['candidates'][0]['content']['parts'][0]['text']
            
            structured_data = json.loads(ai_text_response)
            structured_data["raw_text_dump"] = combined_ocr_text 
            
            return structured_data
        except Exception as e:
            fallback_data["error"] = str(e)
            return fallback_data