"""
DBSCAN-based fraud ring detector.

Clusters claims by (normalised_timestamp, zone_encoded, device_fingerprint_hash)
and flags clusters that exceed configured thresholds.
"""

import hashlib
import ipaddress
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

import numpy as np
from sklearn.preprocessing import LabelEncoder

from app.config import settings
from app.schemas.rings import ClusterDetail, RingAlert

logger = logging.getLogger(__name__)

# Shared in-process store for active ring alerts (sufficient for a single-instance service)
_active_alerts: list[RingAlert] = []


def _fp_hash(fp: dict[str, Any]) -> str:
    """Deterministic short hash of OS + screen_resolution + carrier fields (non-cryptographic bucketing)."""
    key = "|".join(
        [
            str(fp.get("os", "")),
            str(fp.get("screen_resolution", "")),
            str(fp.get("carrier", "")),
        ]
    )
    return hashlib.sha256(key.encode()).hexdigest()[:8]


def _ip_subnet(ip_str: str) -> str | None:
    """Return /24 subnet string for IPv4, None on failure."""
    try:
        net = ipaddress.IPv4Network(ip_str + "/24", strict=False)
        return str(net)
    except Exception:
        return None


def _shared_device_ratio(claim_ids: list[str], fp_hashes: dict[str, str]) -> float:
    """Fraction of claims sharing a fingerprint bucket with at least one other claim."""
    counts: dict[str, int] = {}
    for cid in claim_ids:
        h = fp_hashes.get(cid, "")
        counts[h] = counts.get(h, 0) + 1

    shared = sum(1 for cid in claim_ids if counts.get(fp_hashes.get(cid, ""), 0) > 1)
    return shared / len(claim_ids) if claim_ids else 0.0


def _ip_subnet_overlap(claim_ids: list[str], subnets: dict[str, str | None]) -> bool:
    """True if any /24 subnet appears in more than one claim."""
    seen: dict[str, int] = {}
    for cid in claim_ids:
        sn = subnets.get(cid)
        if sn:
            seen[sn] = seen.get(sn, 0) + 1
            if seen[sn] > 1:
                return True
    return False


def _encode_zone(zones: list[str]) -> np.ndarray:
    le = LabelEncoder()
    return le.fit_transform(zones).astype(float)


def _ts_to_minutes(ts_str: str) -> float:
    """Convert ISO-8601 timestamp to minutes since Unix epoch."""
    try:
        dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        return dt.timestamp() / 60.0
    except Exception:
        return 0.0


def detect_rings(claims: list[dict[str, Any]]) -> tuple[bool, int, list[str], str, list[ClusterDetail]]:
    """
    Run DBSCAN on the provided claims.

    Returns:
        is_ring: bool
        cluster_count: number of suspicious clusters
        suspicious_claim_ids: list of claim IDs in suspicious clusters
        recommendation: human-readable recommendation string
        cluster_details: per-cluster metadata
    """
    if len(claims) < settings.dbscan_min_samples:
        return False, 0, [], "Insufficient claims for ring analysis.", []

    # Build feature matrix: [normalised_ts, zone_encoded, fp_hash_int]
    timestamps_min = np.array([_ts_to_minutes(c["timestamp"]) for c in claims])
    zones = [c["zone"] for c in claims]
    zone_encoded = _encode_zone(zones)

    fp_hashes = {c["claim_id"]: _fp_hash(c.get("device_fingerprint", {})) for c in claims}
    subnets = {c["claim_id"]: _ip_subnet(c.get("ip_address", "")) for c in claims}
    fraud_scores = {c["claim_id"]: float(c.get("fraud_score", 0.0)) for c in claims}

    # Encode fp_hash as integer for numeric feature
    hash_ints = np.array(
        [int(fp_hashes[c["claim_id"]], 16) % 1000 for c in claims], dtype=float
    )

    # Normalise each dimension to [0, 1]
    def _norm(arr: np.ndarray) -> np.ndarray:
        rng = arr.max() - arr.min()
        return (arr - arr.min()) / rng if rng > 0 else np.zeros_like(arr)

    X = np.column_stack([_norm(timestamps_min), _norm(zone_encoded), _norm(hash_ints)])

    from sklearn.cluster import DBSCAN  # imported here to keep top-level imports lightweight

    db = DBSCAN(eps=settings.dbscan_eps, min_samples=settings.dbscan_min_samples)
    labels = db.fit_predict(X)

    # Collect non-noise cluster IDs
    cluster_ids = set(labels[labels != -1])
    if not cluster_ids:
        return False, 0, [], "No coordinated clusters detected.", []

    suspicious_claim_ids: list[str] = []
    cluster_details: list[ClusterDetail] = []
    ring_clusters = 0

    for cid in sorted(cluster_ids):
        idx = np.where(labels == cid)[0]
        cluster_claims = [claims[i] for i in idx]
        c_ids = [c["claim_id"] for c in cluster_claims]

        avg_fraud = float(np.mean([fraud_scores[cid_] for cid_ in c_ids]))
        sdr = _shared_device_ratio(c_ids, fp_hashes)
        ip_overlap = _ip_subnet_overlap(c_ids, subnets)

        is_suspicious = (
            avg_fraud > settings.ring_avg_fraud_threshold
            or sdr > settings.ring_shared_device_ratio
            or ip_overlap
        )

        if is_suspicious:
            ring_clusters += 1
            suspicious_claim_ids.extend(c_ids)
            cluster_details.append(
                ClusterDetail(
                    cluster_id=int(cid),
                    claim_ids=c_ids,
                    avg_fraud_score=round(avg_fraud, 4),
                    shared_device_ratio=round(sdr, 4),
                    ip_subnet_overlap=ip_overlap,
                )
            )

    suspicious_claim_ids = list(dict.fromkeys(suspicious_claim_ids))  # deduplicate, preserve order

    if ring_clusters == 0:
        return False, 0, [], "Clusters detected but none meet ring thresholds.", cluster_details

    rec = (
        f"Escalate {ring_clusters} cluster(s) containing {len(suspicious_claim_ids)} claim(s) "
        f"to fraud investigation team. "
        f"Avg fraud score: {round(float(np.mean([c.avg_fraud_score for c in cluster_details])), 2)}."
    )

    return True, ring_clusters, suspicious_claim_ids, rec, cluster_details


def record_ring_alert(
    zone: str,
    cluster_count: int,
    suspicious_claim_ids: list[str],
    avg_fraud_score: float,
    recommendation: str,
) -> RingAlert:
    alert = RingAlert(
        alert_id=str(uuid.uuid4()),
        zone=zone,
        detected_at=datetime.now(timezone.utc).isoformat(),
        cluster_count=cluster_count,
        suspicious_claim_ids=suspicious_claim_ids,
        avg_fraud_score=round(avg_fraud_score, 4),
        recommendation=recommendation,
    )
    _active_alerts.append(alert)
    return alert


def get_active_alerts() -> list[RingAlert]:
    return list(_active_alerts)
