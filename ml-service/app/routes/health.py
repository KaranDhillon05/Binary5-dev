from fastapi import APIRouter

from app.models.risk_model import risk_model

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "models": {
            "risk_model": "trained" if risk_model.is_trained else "fallback",
            "fraud_model": "ready",
            "ring_detector": "ready",
        },
        "version": "1.0.0",
    }
