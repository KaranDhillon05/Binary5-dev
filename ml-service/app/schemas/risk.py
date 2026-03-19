from pydantic import BaseModel, Field
from typing import Optional


class WorkerRiskInput(BaseModel):
    zone: str = Field(..., description="Delivery zone name", examples=["Koramangala"])
    city: str = Field(..., description="City name", examples=["Bengaluru"])
    tenure_weeks: int = Field(..., ge=0, description="Worker tenure in weeks")
    delivery_hours_per_day: float = Field(..., gt=0, le=24, description="Average daily delivery hours")
    platform: str = Field(..., description="Gig platform name", examples=["zepto"])
    month: int = Field(..., ge=1, le=12, description="Calendar month (1-12)")
    season: Optional[str] = Field(None, description="Season override; auto-derived from month if omitted")


class RiskScoreOutput(BaseModel):
    risk_multiplier: float = Field(..., description="Risk multiplier in range [0.8, 1.3]")
    breakdown: dict = Field(..., description="Per-factor contribution to the multiplier")
    recommended_tier: str = Field(..., description="Recommended insurance tier")
