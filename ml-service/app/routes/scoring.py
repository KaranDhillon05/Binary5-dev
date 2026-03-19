import logging

from fastapi import APIRouter, HTTPException

from app.models.fraud_model import fraud_model
from app.models.risk_model import risk_model
from app.schemas.fraud import ClaimFraudInput, FraudScoreOutput
from app.schemas.risk import RiskScoreOutput, WorkerRiskInput

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/score", tags=["scoring"])


@router.post("/risk", response_model=RiskScoreOutput)
def score_risk(payload: WorkerRiskInput) -> RiskScoreOutput:
    """
    Compute a risk multiplier for a delivery worker.

    Uses the trained GBT model when available; falls back to rule-based logic.
    """
    try:
        multiplier, breakdown = risk_model.predict(
            zone=payload.zone,
            delivery_hours_per_day=payload.delivery_hours_per_day,
            tenure_weeks=payload.tenure_weeks,
            platform=payload.platform,
            month=payload.month,
        )
    except Exception as exc:
        logger.exception("Risk scoring failed: %s", exc)
        raise HTTPException(status_code=500, detail="Risk scoring failed.") from exc

    return RiskScoreOutput(
        risk_multiplier=round(multiplier, 4),
        breakdown=breakdown,
        recommended_tier=risk_model.recommended_tier(multiplier),
    )


@router.post("/fraud", response_model=FraudScoreOutput)
def score_fraud(payload: ClaimFraudInput) -> FraudScoreOutput:
    """
    Score an insurance claim across six fraud signals.
    """
    try:
        trip_dicts = [p.model_dump() for p in payload.trip_history]
        fraud_score, decision, breakdown = fraud_model.score(
            ip_address=payload.ip_address,
            gps_lat=payload.gps_lat,
            gps_lng=payload.gps_lng,
            device_fingerprint=payload.device_fingerprint,
            network_type=payload.network_type,
            weather_data=payload.weather_data,
            claim_type=payload.claim_type,
            trip_history=trip_dicts,
            timestamp=payload.timestamp,
        )
    except Exception as exc:
        logger.exception("Fraud scoring failed for claim %s: %s", payload.claim_id, exc)
        raise HTTPException(status_code=500, detail="Fraud scoring failed.") from exc

    return FraudScoreOutput(
        fraud_score=fraud_score,
        decision=decision,
        signal_breakdown=breakdown,
    )
