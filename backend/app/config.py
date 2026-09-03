from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/rural_business_advisor"
    auth_secret: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    app_url: str = "http://localhost:4000"
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:4000",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
