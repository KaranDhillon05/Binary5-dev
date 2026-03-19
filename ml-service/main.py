from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.routes.health import router as health_router
from app.routes.scoring import router as scoring_router
from app.routes.rings import router as rings_router
from app.data.training import ensure_models_trained

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Q-Shield ML Service starting up...")
    ensure_models_trained()
    logger.info("All models ready. Service is live.")
    yield
    logger.info("Q-Shield ML Service shutting down.")


app = FastAPI(
    title="Q-Shield ML Service",
    description="ML-powered risk scoring, fraud detection, and ring detection for parametric income insurance.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(health_router)
app.include_router(scoring_router)
app.include_router(rings_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )
