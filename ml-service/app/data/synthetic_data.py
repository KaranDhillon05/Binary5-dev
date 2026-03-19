"""
Synthetic training data generator for the GBT risk scoring model.

Produces 1,000 worker samples with realistic feature distributions
for Bengaluru gig-delivery workers across six zones.
"""

import random
from typing import Any

import numpy as np

ZONES = ["Koramangala", "HSR Layout", "Indiranagar", "Whitefield", "Jayanagar", "Marathahalli"]
PLATFORMS = ["zepto", "blinkit", "swiggy_instamart"]
MONSOON_MONTHS = {6, 7, 8, 9}

# Zone risk scores (mirrors risk_model.py constants)
ZONE_RISK_SCORES = {
    "Koramangala": 1.2,
    "HSR Layout": 1.0,
    "Indiranagar": 1.1,
    "Whitefield": 0.9,
    "Jayanagar": 0.85,
    "Marathahalli": 1.15,
}

ZONE_DISRUPTION_FREQ = {
    "Koramangala": 0.35,
    "HSR Layout": 0.20,
    "Indiranagar": 0.28,
    "Whitefield": 0.15,
    "Jayanagar": 0.12,
    "Marathahalli": 0.30,
}

FLOOD_PRONE = {"koramangala", "marathahalli", "indiranagar"}
FLOOD_SAFE = {"whitefield", "jayanagar"}

PLATFORM_SCORES = {"zepto": 1.1, "blinkit": 1.1, "swiggy_instamart": 1.0}


def _rule_based_multiplier(zone: str, month: int, tenure_weeks: int) -> float:
    """Reproduce the rule-based logic to generate ground-truth labels."""
    score = 1.0
    if month in MONSOON_MONTHS:
        score += 0.15
    zk = zone.lower()
    if zk in FLOOD_PRONE:
        score += 0.10
    elif zk in FLOOD_SAFE:
        score -= 0.08
    if tenure_weeks < 4:
        score += 0.05
    disruption_freq = ZONE_DISRUPTION_FREQ.get(zone, 0.20)
    if disruption_freq > 0.28:
        score += 0.12
    return float(np.clip(score, 0.8, 1.3))


def generate_synthetic_data(n_samples: int = 1000, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """
    Generate synthetic training data for the GBT risk model.

    Returns:
        X: feature matrix (n_samples, 7)
        y: risk multiplier targets (n_samples,)
    """
    rng = np.random.default_rng(seed)
    random.seed(seed)

    zones = rng.choice(ZONES, size=n_samples)
    platforms = rng.choice(PLATFORMS, size=n_samples)
    tenure_weeks = rng.integers(1, 105, size=n_samples)
    delivery_hours = rng.uniform(3.0, 12.0, size=n_samples)
    months = rng.integers(1, 13, size=n_samples)

    zone_risk_scores = np.array([ZONE_RISK_SCORES[z] for z in zones])
    disruption_freqs = np.array([ZONE_DISRUPTION_FREQ[z] for z in zones])
    season_scores = np.where(np.isin(months, list(MONSOON_MONTHS)), 1.3, 1.0)
    platform_scores = np.array([PLATFORM_SCORES.get(p, 1.0) for p in platforms])

    X = np.column_stack(
        [
            zone_risk_scores,
            disruption_freqs,
            delivery_hours,
            tenure_weeks.astype(float),
            season_scores,
            platform_scores,
            months.astype(float),
        ]
    )

    y = np.array(
        [
            _rule_based_multiplier(zones[i], int(months[i]), int(tenure_weeks[i]))
            + rng.normal(0, 0.02)  # small noise to prevent perfect memorisation
            for i in range(n_samples)
        ]
    )
    y = np.clip(y, 0.8, 1.3)

    return X, y
