import logging

import numpy as np
from fastapi import APIRouter, HTTPException

from app.models.ring_detector import detect_rings, get_active_alerts, record_ring_alert
from app.schemas.rings import RingDetectionInput, RingDetectionOutput, RingStatusOutput

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rings", tags=["ring-detection"])


@router.post("/detect", response_model=RingDetectionOutput)
def detect_ring(payload: RingDetectionInput) -> RingDetectionOutput:
    """
    Run DBSCAN-based ring detection on a batch of recent claims.

    Clusters by (timestamp, zone, device_fingerprint) and flags clusters
    that exceed fraud-score or shared-device thresholds.
    """
    try:
        claims_dicts = [c.model_dump() for c in payload.claims]
        is_ring, cluster_count, suspicious_ids, recommendation, details = detect_rings(claims_dicts)
    except Exception as exc:
        logger.exception("Ring detection failed: %s", exc)
        raise HTTPException(status_code=500, detail="Ring detection failed.") from exc

    if is_ring and details:
        avg_fraud = float(np.mean([d.avg_fraud_score for d in details]))
        zones = list({c["zone"] for c in claims_dicts})
        record_ring_alert(
            zone=zones[0] if len(zones) == 1 else "multiple",
            cluster_count=cluster_count,
            suspicious_claim_ids=suspicious_ids,
            avg_fraud_score=avg_fraud,
            recommendation=recommendation,
        )

    return RingDetectionOutput(
        is_ring=is_ring,
        cluster_count=cluster_count,
        suspicious_claims=suspicious_ids,
        recommendation=recommendation,
        cluster_details=details,
    )


@router.get("/status", response_model=RingStatusOutput)
def ring_status() -> RingStatusOutput:
    """Return all currently active ring alerts recorded in this process."""
    alerts = get_active_alerts()
    return RingStatusOutput(active_alerts=alerts, total_active=len(alerts))
