import json
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_BASE_DIR / ".env", ".env"),
        extra="ignore",
    )

    database_url: str = "postgresql://localhost:5432/rural_business_advisor"
    auth_secret: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    llm_api_key: str = ""
    llm_base_url: str = ""
    llm_model: str = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning"
    app_url: str = "http://localhost:4000"

    # Accept either comma-separated or JSON array string from env var
    # Render env var should be:  https://foo.vercel.app,https://bar.vercel.app
    # Or JSON:                   ["https://foo.vercel.app"]
    allowed_origins_raw: str = "http://localhost:3000,http://localhost:4000"

    @property
    def allowed_origins(self) -> list[str]:
        val = self.allowed_origins_raw.strip()
        if val.startswith("["):
            try:
                return json.loads(val)
            except json.JSONDecodeError:
                pass
        return [o.strip() for o in val.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
