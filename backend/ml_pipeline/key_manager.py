import os
from dotenv import load_dotenv
from core.config import settings

class GeminiKeyManager:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(GeminiKeyManager, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance
        
    def __init__(self):
        if self._initialized:
            return
        self._keys = []
        self._current_index = 0
        self.load_keys()
        self._initialized = True

    def load_keys(self):
        """Loads and reloads API keys dynamically from the environment and .env file."""
        try:
            # Find the root .env file path relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)
            project_root = os.path.dirname(backend_dir)
            env_path = os.path.join(project_root, ".env")
            
            if os.path.exists(env_path):
                load_dotenv(env_path, override=True)
            else:
                load_dotenv(override=True)
        except Exception as e:
            print(f"[GeminiKeyManager] Failed to load .env: {e}")
            
        possible_keys = [
            os.getenv("GEMINI_API_KEY"),
            os.getenv("GEMINI_API_KEY_1"),
            os.getenv("GEMINI_API_KEY_2"),
            os.getenv("GEMINI_API_KEY_3"),
            os.getenv("GEMINI_API_KEY_4"),
            os.getenv("GEMINI_API_KEY_5"),
        ]
        
        # Filter out placeholders, None, or empty keys
        placeholders = {
            "your_gemini_api_key", "placeholder", "your_key", 
            "your_gemini_api_key_1", "your_gemini_api_key_2", 
            "your_gemini_api_key_3", "your_gemini_api_key_4", 
            "your_gemini_api_key_5"
        }
        
        new_keys = []
        for k in possible_keys:
            if k and isinstance(k, str):
                cleaned = k.strip()
                cleaned_lower = cleaned.lower()
                is_placeholder = (
                    "placeholder" in cleaned_lower or
                    "your_gemini_api_key" in cleaned_lower or
                    "your_key" in cleaned_lower or
                    cleaned_lower in placeholders
                )
                if cleaned and not is_placeholder and cleaned not in new_keys:
                    new_keys.append(cleaned)
                    
        self._keys = new_keys

    def get_api_key(self) -> str:
        self.load_keys()
        if not self._keys:
            fallback = os.getenv("GEMINI_API_KEY", "")
            return fallback.strip() if fallback else ""
        return self._keys[self._current_index % len(self._keys)]
        
    def handle_exhaustion(self, current_key: str):
        """Marks the current key as exhausted/failed and cycles to the next one."""
        self.load_keys()
        if not self._keys:
            return
        
        # Make sure the key matches our current key before cycling (prevent race condition)
        try:
            current_idx = self._keys.index(current_key)
        except ValueError:
            current_idx = self._current_index % len(self._keys)
            
        old_index = current_idx
        self._current_index = (current_idx + 1) % len(self._keys)
        print(f"[GeminiKeyManager] API Key {old_index + 1} exhausted/failed/rate-limited. Cycled to key {self._current_index + 1} of {len(self._keys)}.")
            
    def get_all_keys(self):
        self.load_keys()
        return self._keys

# Export a singleton instance
key_manager = GeminiKeyManager()
