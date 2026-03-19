"""
Weighted multi-signal fraud scoring model.

fraud_score = (
    0.20 × ip_mismatch_score +
    0.20 × device_anomaly_score +
    0.15 × network_pattern_score +
    0.25 × weather_coherence_score +
    0.10 × trip_history_score +
    0.10 × velocity_score
)
"""

import logging
import math
from datetime import datetime
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

# Signal weights
WEIGHTS = {
    "ip_mismatch_score": 0.20,
    "device_anomaly_score": 0.20,
    "network_pattern_score": 0.15,
    "weather_coherence_score": 0.25,
    "trip_history_score": 0.10,
    "velocity_score": 0.10,
}

# Approximate city bounding boxes (lat_min, lat_max, lng_min, lng_max)
CITY_BOUNDS: dict[str, tuple[float, float, float, float]] = {
    "bengaluru": (12.80, 13.10, 77.45, 77.80),
    "bangalore": (12.80, 13.10, 77.45, 77.80),
    "mumbai": (18.85, 19.30, 72.75, 73.00),
    "delhi": (28.40, 28.90, 76.85, 77.40),
    "hyderabad": (17.20, 17.60, 78.30, 78.65),
    "chennai": (12.85, 13.25, 80.10, 80.35),
    "pune": (18.40, 18.70, 73.75, 74.05),
}

UNUSUAL_SCREEN_RESOLUTIONS = {
    "emulator": True,
    "0x0": True,
    "1x1": True,
    "1024x768": True,
    "800x600": True,
}

MAX_REALISTIC_SPEED_KMH = 80.0  # max speed a delivery rider can travel


# ---------------------------------------------------------------------------
# Geo helpers
# ---------------------------------------------------------------------------

def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return great-circle distance in km between two coordinate pairs."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _city_for_coords(lat: float, lng: float) -> str | None:
    for city, (lat_min, lat_max, lng_min, lng_max) in CITY_BOUNDS.items():
        if lat_min <= lat <= lat_max and lng_min <= lng <= lng_max:
            return city
    return None


def _ip_to_mock_location(ip: str) -> dict[str, Any]:
    """
    Mock IP geolocation lookup. In production this would call ip-api.com.
    Uses a deterministic hash of the IP octets to simulate city assignment.
    """
    try:
        octets = [int(o) for o in ip.split(".")]
        idx = (octets[0] + octets[1]) % len(CITY_BOUNDS)
        city = list(CITY_BOUNDS.keys())[idx]
        bounds = CITY_BOUNDS[city]
        lat = (bounds[0] + bounds[1]) / 2
        lng = (bounds[2] + bounds[3]) / 2
        return {"city": city, "lat": lat, "lng": lng, "status": "success"}
    except Exception as exc:
        logger.warning("IP geolocation failed for %r: %s", ip, exc)
        return {"city": None, "lat": None, "lng": None, "status": "error"}


# ---------------------------------------------------------------------------
# Individual signal scorers
# ---------------------------------------------------------------------------

def ip_mismatch_score(ip_address: str, gps_lat: float, gps_lng: float) -> float:
    """
    Compare IP geolocation with GPS coordinates.
    Different city → 0.9 | Same city, different zone → 0.3 | Same zone → 0.0
    """
    ip_loc = _ip_to_mock_location(ip_address)
    if ip_loc["status"] != "success" or ip_loc["lat"] is None:
        return 0.3  # unknown → moderate suspicion

    ip_city = ip_loc["city"]
    gps_city = _city_for_coords(gps_lat, gps_lng)

    if gps_city is None:
        return 0.3

    if ip_city != gps_city:
        return 0.9

    # Same city — check proximity (< 5 km is considered "same zone")
    dist = _haversine_km(gps_lat, gps_lng, ip_loc["lat"], ip_loc["lng"])
    if dist <= 5.0:
        return 0.0
    return 0.3


def device_anomaly_score(fingerprint: dict[str, Any]) -> float:
    """
    Check fingerprint for emulator / rooted device indicators.
    dev_mode=True → 0.8 | rooted=True → 0.6 | unusual screen res → 0.4 | normal → 0.0
    """
    if fingerprint.get("dev_mode") is True:
        return 0.8
    if fingerprint.get("rooted") is True:
        return 0.6
    screen_res = str(fingerprint.get("screen_resolution", "")).lower()
    if screen_res in UNUSUAL_SCREEN_RESOLUTIONS or screen_res == "":
        return 0.4
    return 0.0


def network_pattern_score(
    network_type: str,
    weather_data: dict[str, Any],
    claim_type: str,
) -> float:
    """
    WiFi + stable during claimed disruption → 0.7
    Mobile data + unstable → 0.1
    Mobile data + stable → 0.3
    """
    net = network_type.strip().lower()
    condition = str(weather_data.get("condition", "")).lower()
    is_disruption_claim = "disruption" in claim_type.lower() or "rain" in claim_type.lower()

    disruption_conditions = {"heavy_rain", "rain", "storm", "flood", "hail"}
    api_shows_disruption = any(d in condition for d in disruption_conditions)

    if net == "wifi" and is_disruption_claim and not api_shows_disruption:
        return 0.7
    if net == "wifi" and is_disruption_claim:
        # WiFi during claimed outdoor disruption is slightly suspicious
        return 0.4
    if net == "mobile_data":
        if api_shows_disruption:
            return 0.1
        return 0.3
    return 0.2


def weather_coherence_score(weather_data: dict[str, Any]) -> float:
    """
    Compare worker-reported weather with API weather data.
    Mismatch (claim heavy rain, API says clear) → 0.95
    Match (both rain) → 0.0
    Partial → 0.3
    """
    api_condition = str(weather_data.get("condition", "")).lower().replace(" ", "_")
    worker_reported = str(weather_data.get("reported_by_worker", "")).lower().replace(" ", "_")

    rain_keywords = {"rain", "heavy_rain", "drizzle", "storm", "thunderstorm", "hail", "flood"}
    clear_keywords = {"clear", "sunny", "fair", "partly_cloudy", "cloudy"}

    api_is_rain = any(k in api_condition for k in rain_keywords)
    api_is_clear = any(k in api_condition for k in clear_keywords)
    worker_claims_rain = any(k in worker_reported for k in rain_keywords)

    if worker_claims_rain and api_is_clear:
        return 0.95
    if worker_claims_rain and api_is_rain:
        return 0.0
    if worker_claims_rain and not api_is_clear and not api_is_rain:
        return 0.3
    return 0.1


def trip_history_score(trip_history: list[dict[str, Any]]) -> float:
    """
    Check historical routes for consistency anomalies.
    Teleportation → 0.9 | Perfect grid movement → 0.8 | Natural variance → 0.1
    """
    if len(trip_history) < 2:
        return 0.1

    points = []
    for p in trip_history:
        try:
            ts = datetime.fromisoformat(str(p.get("timestamp", "")).replace("Z", "+00:00"))
            points.append((float(p["lat"]), float(p["lng"]), ts))
        except Exception:
            continue

    if len(points) < 2:
        return 0.1

    points.sort(key=lambda x: x[2])

    max_speed = 0.0
    lat_deltas = []
    lng_deltas = []

    for i in range(1, len(points)):
        lat1, lng1, t1 = points[i - 1]
        lat2, lng2, t2 = points[i]
        dist_km = _haversine_km(lat1, lng1, lat2, lng2)
        elapsed_h = (t2 - t1).total_seconds() / 3600.0
        if elapsed_h > 0:
            speed = dist_km / elapsed_h
            max_speed = max(max_speed, speed)
        lat_deltas.append(abs(lat2 - lat1))
        lng_deltas.append(abs(lng2 - lng1))

    if max_speed > MAX_REALISTIC_SPEED_KMH * 5:
        return 0.9

    # Detect perfect grid movement (suspiciously uniform deltas)
    if len(lat_deltas) >= 3:
        lat_variance = _variance(lat_deltas)
        lng_variance = _variance(lng_deltas)
        if lat_variance < 1e-8 and lng_variance < 1e-8:
            return 0.8

    return 0.1


def velocity_score(trip_history: list[dict[str, Any]], claim_timestamp: str) -> float:
    """
    Check if movement between pings is physically possible.
    Impossible speed → 0.9 | Borderline → 0.5 | Normal → 0.0
    """
    if len(trip_history) < 2:
        return 0.0

    points = []
    for p in trip_history:
        try:
            ts = datetime.fromisoformat(str(p.get("timestamp", "")).replace("Z", "+00:00"))
            points.append((float(p["lat"]), float(p["lng"]), ts))
        except Exception:
            continue

    if len(points) < 2:
        return 0.0

    points.sort(key=lambda x: x[2])
    max_speed = 0.0

    for i in range(1, len(points)):
        lat1, lng1, t1 = points[i - 1]
        lat2, lng2, t2 = points[i]
        dist_km = _haversine_km(lat1, lng1, lat2, lng2)
        elapsed_h = (t2 - t1).total_seconds() / 3600.0
        if elapsed_h > 0:
            max_speed = max(max_speed, dist_km / elapsed_h)

    if max_speed > MAX_REALISTIC_SPEED_KMH * 3:
        return 0.9
    if max_speed > MAX_REALISTIC_SPEED_KMH:
        return 0.5
    return 0.0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _variance(values: list[float]) -> float:
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    return sum((v - mean) ** 2 for v in values) / len(values)


# ---------------------------------------------------------------------------
# Aggregate scorer
# ---------------------------------------------------------------------------

class FraudModel:
    """Stateless weighted multi-signal fraud scorer."""

    def score(
        self,
        ip_address: str,
        gps_lat: float,
        gps_lng: float,
        device_fingerprint: dict[str, Any],
        network_type: str,
        weather_data: dict[str, Any],
        claim_type: str,
        trip_history: list[dict[str, Any]],
        timestamp: str,
    ) -> tuple[float, str, dict[str, float]]:
        signals = {
            "ip_mismatch_score": ip_mismatch_score(ip_address, gps_lat, gps_lng),
            "device_anomaly_score": device_anomaly_score(device_fingerprint),
            "network_pattern_score": network_pattern_score(network_type, weather_data, claim_type),
            "weather_coherence_score": weather_coherence_score(weather_data),
            "trip_history_score": trip_history_score(trip_history),
            "velocity_score": velocity_score(trip_history, timestamp),
        }

        aggregate = sum(WEIGHTS[k] * v for k, v in signals.items())
        aggregate = round(min(max(aggregate, 0.0), 1.0), 4)

        if aggregate < settings.fraud_threshold_auto_approve:
            decision = "auto_approve"
        elif aggregate <= settings.fraud_threshold_manual_review:
            decision = "fast_verify"
        else:
            decision = "manual_review"

        return aggregate, decision, {k: round(v, 4) for k, v in signals.items()}


fraud_model = FraudModel()
