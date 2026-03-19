"""
GradientBoostingRegressor-based risk scoring model.

Produces a risk_multiplier in [0.8, 1.3] for a delivery worker given
zone, tenure, platform, seasonality, and weather-disruption features.
Falls back to explicit rule-based logic when the model has not been trained.
"""

import os
import logging
from typing import Optional

import numpy as np
import joblib

from app.config import settings

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(settings.model_dir, "risk_model.joblib")

# Zone risk scores derived from historical flood/disruption data for Bengaluru zones
ZONE_RISK_SCORES: dict[str, float] = {
    "koramangala": 1.2,
    "hsr layout": 1.0,
    "indiranagar": 1.1,
    "whitefield": 0.9,
    "jayanagar": 0.85,
    "marathahalli": 1.15,
    "electronic city": 0.95,
    "bannerghatta": 1.0,
    "btm layout": 1.1,
    "jp nagar": 0.9,
}

FLOOD_PRONE_ZONES = {"koramangala", "marathahalli", "indiranagar", "btm layout"}
FLOOD_SAFE_ZONES = {"whitefield", "jayanagar", "jp nagar"}

ZONE_WEATHER_DISRUPTION_FREQ: dict[str, float] = {
    "koramangala": 0.35,
    "hsr layout": 0.20,
    "indiranagar": 0.28,
    "whitefield": 0.15,
    "jayanagar": 0.12,
    "marathahalli": 0.30,
    "electronic city": 0.18,
    "bannerghatta": 0.22,
    "btm layout": 0.25,
    "jp nagar": 0.14,
}

PLATFORM_SCORES: dict[str, float] = {
    "zepto": 1.1,
    "blinkit": 1.1,
    "swiggy_instamart": 1.0,
    "dunzo": 1.0,
    "zomato": 1.0,
}

MONSOON_MONTHS = {6, 7, 8, 9}


def _zone_key(zone: str) -> str:
    return zone.strip().lower()


def _get_zone_risk_score(zone: str) -> float:
    return ZONE_RISK_SCORES.get(_zone_key(zone), 1.0)


def _get_weather_disruption_freq(zone: str) -> float:
    return ZONE_WEATHER_DISRUPTION_FREQ.get(_zone_key(zone), 0.20)


def _get_season_score(month: int) -> float:
    return 1.3 if month in MONSOON_MONTHS else 1.0


def _get_platform_score(platform: str) -> float:
    return PLATFORM_SCORES.get(platform.strip().lower(), 1.0)


def _build_feature_vector(
    zone: str,
    delivery_hours_per_day: float,
    tenure_weeks: int,
    platform: str,
    month: int,
) -> np.ndarray:
    return np.array(
        [
            _get_zone_risk_score(zone),
            _get_weather_disruption_freq(zone),
            delivery_hours_per_day,
            tenure_weeks,
            _get_season_score(month),
            _get_platform_score(platform),
            float(month),
        ],
        dtype=float,
    ).reshape(1, -1)


def _rule_based_score(zone: str, month: int, tenure_weeks: int) -> tuple[float, dict]:
    """Fallback rule-based risk multiplier when GBT model is unavailable."""
    score = 1.0
    breakdown: dict[str, float] = {"base": 1.0}

    if month in MONSOON_MONTHS:
        score += 0.15
        breakdown["monsoon_adjustment"] = 0.15

    zk = _zone_key(zone)
    if zk in FLOOD_PRONE_ZONES:
        score += 0.10
        breakdown["zone_adjustment"] = 0.10
    elif zk in FLOOD_SAFE_ZONES:
        score -= 0.08
        breakdown["zone_adjustment"] = -0.08
    else:
        breakdown["zone_adjustment"] = 0.0

    if tenure_weeks < 4:
        score += 0.05
        breakdown["tenure_adjustment"] = 0.05
    else:
        breakdown["tenure_adjustment"] = 0.0

    disruption_freq = _get_weather_disruption_freq(zone)
    if disruption_freq > 0.28:
        score += 0.12
        breakdown["high_disruption_adjustment"] = 0.12

    breakdown["model"] = "rule_based"  # type: ignore[assignment]
    return float(np.clip(score, 0.8, 1.3)), breakdown


class RiskModel:
    """Wraps the persisted GBT model with a rule-based fallback."""

    def __init__(self) -> None:
        self._model = None
        self._load()

    def _load(self) -> None:
        if os.path.exists(MODEL_PATH):
            try:
                self._model = joblib.load(MODEL_PATH)
                logger.info("Risk model loaded from %s", MODEL_PATH)
            except Exception as exc:
                logger.warning("Failed to load risk model: %s", exc)
                self._model = None
        else:
            logger.info("No saved risk model found; will use rule-based fallback.")

    def save(self, model) -> None:
        os.makedirs(settings.model_dir, exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        self._model = model
        logger.info("Risk model saved to %s", MODEL_PATH)

    @property
    def is_trained(self) -> bool:
        return self._model is not None

    def predict(
        self,
        zone: str,
        delivery_hours_per_day: float,
        tenure_weeks: int,
        platform: str,
        month: int,
    ) -> tuple[float, dict]:
        if self._model is None:
            return _rule_based_score(zone, month, tenure_weeks)

        X = _build_feature_vector(zone, delivery_hours_per_day, tenure_weeks, platform, month)
        raw = float(self._model.predict(X)[0])
        multiplier = float(np.clip(raw, 0.8, 1.3))

        breakdown = {
            "zone_risk_score": round(_get_zone_risk_score(zone), 3),
            "weather_disruption_freq": round(_get_weather_disruption_freq(zone), 3),
            "season_score": round(_get_season_score(month), 2),
            "platform_score": round(_get_platform_score(platform), 2),
            "raw_prediction": round(raw, 4),
            "model": "gbt",
        }
        return multiplier, breakdown

    def recommended_tier(self, risk_multiplier: float) -> str:
        if risk_multiplier <= 0.95:
            return "low_risk"
        if risk_multiplier <= 1.10:
            return "standard"
        return "high_risk"


# Module-level singleton
risk_model = RiskModel()


def get_feature_names() -> list[str]:
    return [
        "zone_risk_score",
        "weather_disruption_frequency",
        "delivery_hours_per_day",
        "tenure_weeks",
        "season_score",
        "platform_score",
        "month",
    ]


def build_feature_matrix(records: list[dict]) -> np.ndarray:
    rows = []
    for r in records:
        rows.append(
            _build_feature_vector(
                r["zone"],
                r["delivery_hours_per_day"],
                r["tenure_weeks"],
                r["platform"],
                r["month"],
            ).flatten()
        )
    return np.vstack(rows)
