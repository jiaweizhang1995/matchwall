from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ADMIN_PASSWORD: str = "admin888"
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_EXPIRE_DAYS: int = 7
    MAX_UPLOAD_MB: int = 5

    DATA_DIR: str = str(Path(__file__).resolve().parent.parent / "data")
    STATIC_DIR: str = str(Path(__file__).resolve().parent.parent / "static")

    @property
    def data_path(self) -> Path:
        p = Path(self.DATA_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def db_path(self) -> Path:
        return self.data_path / "app.db"

    @property
    def upload_path(self) -> Path:
        p = self.data_path / "uploads"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def static_path(self) -> Path:
        return Path(self.STATIC_DIR)


settings = Settings()
