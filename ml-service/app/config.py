from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    model_dir: str = "./saved_models"

    # Ring detection thresholds
    ring_cluster_threshold: int = 10
    ring_time_window_minutes: int = 15
    ring_avg_fraud_threshold: float = 0.4
    ring_shared_device_ratio: float = 0.3

    # DBSCAN parameters
    dbscan_eps: float = 0.5
    dbscan_min_samples: int = 3

    # External API bases (empty string → use mocks)
    ip_api_base_url: str = "http://ip-api.com/json"
    weather_api_key: str = ""
    weather_api_base_url: str = "https://api.openweathermap.org/data/2.5"

    # Fraud decision thresholds
    fraud_threshold_auto_approve: float = 0.3
    fraud_threshold_manual_review: float = 0.7


settings = Settings()
