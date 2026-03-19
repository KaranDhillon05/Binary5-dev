from pydantic import BaseModel, Field
from typing import Any, Optional


class RingClaimItem(BaseModel):
    claim_id: str
    worker_id: str
    zone: str
    timestamp: str
    fraud_score: float = Field(..., ge=0.0, le=1.0)
    device_fingerprint: dict[str, Any] = Field(default_factory=dict)
    ip_address: str = ""
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None


class RingDetectionInput(BaseModel):
    claims: list[RingClaimItem] = Field(..., min_length=1)


class ClusterDetail(BaseModel):
    cluster_id: int
    claim_ids: list[str]
    avg_fraud_score: float
    shared_device_ratio: float
    ip_subnet_overlap: bool


class RingDetectionOutput(BaseModel):
    is_ring: bool
    cluster_count: int
    suspicious_claims: list[str]
    recommendation: str
    cluster_details: list[ClusterDetail] = Field(default_factory=list)


class RingAlert(BaseModel):
    alert_id: str
    zone: str
    detected_at: str
    cluster_count: int
    suspicious_claim_ids: list[str]
    avg_fraud_score: float
    recommendation: str


class RingStatusOutput(BaseModel):
    active_alerts: list[RingAlert]
    total_active: int
