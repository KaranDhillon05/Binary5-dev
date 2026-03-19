"""
Model training script.

Called automatically at service startup when saved models are not found.
"""

import logging
import os

from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

from app.config import settings
from app.data.synthetic_data import generate_synthetic_data
from app.models.risk_model import risk_model, get_feature_names

logger = logging.getLogger(__name__)


def train_risk_model() -> None:
    """Train the GBT risk model on synthetic data and persist it to disk."""
    logger.info("Generating synthetic training data...")
    X, y = generate_synthetic_data(n_samples=1000)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    logger.info("Training GradientBoostingRegressor on %d samples...", len(X_train))
    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        min_samples_split=5,
        subsample=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    logger.info("Risk model trained — R² train=%.4f, test=%.4f", train_score, test_score)

    feature_names = get_feature_names()
    importances = dict(zip(feature_names, model.feature_importances_))
    logger.info("Feature importances: %s", importances)

    os.makedirs(settings.model_dir, exist_ok=True)
    risk_model.save(model)
    logger.info("Risk model saved successfully.")


def ensure_models_trained() -> None:
    """Train any models that are not yet persisted to disk."""
    if not risk_model.is_trained:
        logger.info("Risk model not found — training now.")
        train_risk_model()
    else:
        logger.info("Risk model already trained and loaded.")
