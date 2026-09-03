import json
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/rural_business_advisor"
    auth_secret: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
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
