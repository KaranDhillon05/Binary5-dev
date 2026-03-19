from pydantic import BaseModel, Field
from typing import Any, Optional


class TripPoint(BaseModel):
    lat: float
    lng: float
    timestamp: str


class ClaimFraudInput(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    worker_id: str = Field(..., description="Worker identifier")
    zone: str = Field(..., description="Zone where claim originated")
    gps_lat: float = Field(..., description="GPS latitude at time of claim")
    gps_lng: float = Field(..., description="GPS longitude at time of claim")
    ip_address: str = Field(..., description="IP address of claim submission device")
    device_fingerprint: dict[str, Any] = Field(..., description="Device fingerprint attributes")
    network_type: str = Field(..., description="Network type: wifi | mobile_data | unknown")
    weather_data: dict[str, Any] = Field(
        ...,
        description="Weather context: condition (API result) and reported_by_worker (worker claim)",
    )
    claim_type: str = Field(..., description="Type of income disruption claimed")
    claimed_amount: float = Field(..., gt=0, description="Amount claimed in INR")
    trip_history: list[TripPoint] = Field(default_factory=list, description="Recent GPS trip points")
    timestamp: str = Field(..., description="ISO-8601 claim submission timestamp")


class FraudScoreOutput(BaseModel):
    fraud_score: float = Field(..., description="Aggregated fraud score in [0, 1]")
    decision: str = Field(
        ...,
        description="Decision: auto_approve | fast_verify | manual_review",
    )
    signal_breakdown: dict[str, float] = Field(..., description="Per-signal fraud scores")
