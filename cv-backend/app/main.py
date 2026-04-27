from __future__ import annotations

import math
import os
import tempfile
from dataclasses import dataclass
from typing import Any, Literal, Optional

import cv2  # type: ignore
import mediapipe as mp  # type: ignore
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


StrainLevel = Literal["low", "medium", "high"]


def _risk_from_valgus(valgus: float | None) -> StrainLevel | None:
    if valgus is None:
        return None
    if valgus >= 0.06:
        return "high"
    if valgus >= 0.04:
        return "medium"
    return "low"


@dataclass(frozen=True)
class TelemetryPoint:
    t: float
    frame: int
    leftKneeAngle: Optional[float]
    rightKneeAngle: Optional[float]
    leftValgus: Optional[float]
    rightValgus: Optional[float]


def _angle_degrees(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """
    Angle at point b, given a-b-c in 2D.
    Returns degrees in [0, 180].
    """
    ba = a - b
    bc = c - b
    denom = float(np.linalg.norm(ba) * np.linalg.norm(bc))
    if denom <= 1e-9:
        return float("nan")
    cosang = float(np.clip(np.dot(ba, bc) / denom, -1.0, 1.0))
    return float(math.degrees(math.acos(cosang)))


def _strain_from_valgus(max_valgus: float) -> StrainLevel:
    # Heuristic thresholds; tuned for normalized coordinates.
    if max_valgus >= 0.06:
        return "high"
    if max_valgus >= 0.035:
        return "medium"
    return "low"


def _confidence(landmarks_seen: int, samples: int) -> float:
    if samples <= 0:
        return 0.0
    return float(min(0.99, max(0.1, landmarks_seen / samples)))


def _cue_for_pattern(is_wide_plant: bool, valgus: float) -> str:
    if is_wide_plant and valgus >= 0.06:
        return "Wide plant + valgus collapse"
    if is_wide_plant:
        return "Wide plant"
    if valgus >= 0.06:
        return "Valgus collapse pattern"
    return "No strong valgus-risk pattern"


def run_pose_cv_analysis(video_path: str) -> dict[str, Any]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Could not open uploaded video")

    fps = float(cap.get(cv2.CAP_PROP_FPS) or 0) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    # Sample at ~10 fps to keep CPU reasonable.
    sample_fps = 10.0
    step = max(1, int(round(fps / sample_fps)))

    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        enable_segmentation=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    telemetry: list[TelemetryPoint] = []
    pose_points_by_frame: dict[int, list[dict[str, float]]] = {}
    overlay_points: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []

    samples = 0
    landmarks_seen = 0

    max_valgus_r = 0.0
    max_valgus_l = 0.0
    max_event_r: tuple[float, float, float, float] | None = None  # (t, knee_x, knee_y, valgus)
    max_event_l: tuple[float, float, float, float] | None = None

    def lm_xy(lm: Any) -> np.ndarray:
        return np.array([float(lm.x), float(lm.y)], dtype=np.float32)

    frame_idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break

        if frame_idx % step != 0:
            frame_idx += 1
            continue

        samples += 1
        t = frame_idx / fps

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        res = pose.process(rgb)

        if not res.pose_landmarks:
            telemetry.append(
                TelemetryPoint(
                    t=t,
                    frame=frame_idx,
                    leftKneeAngle=None,
                    rightKneeAngle=None,
                    leftValgus=None,
                    rightValgus=None,
                )
            )
            frame_idx += 1
            continue

        landmarks_seen += 1
        lms = res.pose_landmarks.landmark

        # Store all 33 pose landmarks (normalized coords) for canvas overlay in the frontend.
        pose_points_by_frame[frame_idx] = [
            {"x": float(lm.x), "y": float(lm.y), "v": float(getattr(lm, "visibility", 0.0) or 0.0)}
            for lm in lms
        ]

        lh = lm_xy(lms[mp_pose.PoseLandmark.LEFT_HIP])
        lk = lm_xy(lms[mp_pose.PoseLandmark.LEFT_KNEE])
        la = lm_xy(lms[mp_pose.PoseLandmark.LEFT_ANKLE])

        rh = lm_xy(lms[mp_pose.PoseLandmark.RIGHT_HIP])
        rk = lm_xy(lms[mp_pose.PoseLandmark.RIGHT_KNEE])
        ra = lm_xy(lms[mp_pose.PoseLandmark.RIGHT_ANKLE])

        hip_center_x = float((lh[0] + rh[0]) / 2.0)
        # "Medial" direction is toward hip centerline.
        valgus_r = max(0.0, float(ra[0] - rk[0]))  # right knee collapsing leftward vs ankle
        valgus_l = max(0.0, float(lk[0] - la[0]))  # left knee collapsing rightward vs ankle

        # Knee flexion-ish angle (180 ~ extended).
        knee_angle_r = _angle_degrees(rh, rk, ra)
        knee_angle_l = _angle_degrees(lh, lk, la)

        # Wide plant heuristic: stance width big relative to hip width.
        hip_w = max(1e-6, abs(float(lh[0] - rh[0])))
        stance_w = abs(float(la[0] - ra[0]))
        is_wide_plant = stance_w / hip_w >= 1.55

        telemetry.append(
            TelemetryPoint(
                t=t,
                frame=frame_idx,
                leftKneeAngle=None if math.isnan(knee_angle_l) else float(knee_angle_l),
                rightKneeAngle=None if math.isnan(knee_angle_r) else float(knee_angle_r),
                leftValgus=float(valgus_l),
                rightValgus=float(valgus_r),
            )
        )

        # Track max valgus per side and remember where it occurred for overlays.
        if valgus_r > max_valgus_r:
            max_valgus_r = float(valgus_r)
            max_event_r = (t, float(rk[0]), float(rk[1]), float(valgus_r))
        if valgus_l > max_valgus_l:
            max_valgus_l = float(valgus_l)
            max_event_l = (t, float(lk[0]), float(lk[1]), float(valgus_l))

        # Emit events when pattern crosses thresholds, but avoid spamming by throttling.
        def maybe_add_event(side: str, valgus: float, knee_angle: float | None, kxy: np.ndarray) -> None:
            if valgus < 0.03:
                return
            if knee_angle is None:
                return
            # Gate to moments where knee is somewhat flexed (movement phase).
            if knee_angle > 176:
                return

            risk: StrainLevel = "high" if valgus >= 0.06 else "medium" if valgus >= 0.04 else "low"
            cue = _cue_for_pattern(is_wide_plant=is_wide_plant, valgus=valgus)

            # Throttle: one event per ~0.8s per side.
            last = next((e for e in reversed(events) if e.get("side") == side), None)
            if last and abs(float(last["t"]) - t) < 0.8:
                return

            events.append(
                {
                    "id": f"{side}-{len(events)+1}",
                    "side": side,
                    "risk": risk,
                    "cue": cue,
                    "ic": round(t, 2),
                    "t": round(t, 2),
                    "knee": {"x": float(kxy[0]), "y": float(kxy[1])},
                }
            )

        maybe_add_event("R", float(valgus_r), None if math.isnan(knee_angle_r) else float(knee_angle_r), rk)
        maybe_add_event("L", float(valgus_l), None if math.isnan(knee_angle_l) else float(knee_angle_l), lk)

        frame_idx += 1

    cap.release()
    pose.close()

    # Overlay points: knee location where max valgus happened.
    if max_event_r:
        t, x, y, v = max_event_r
        overlay_points.append({"x": x, "y": y, "label": f"R max valgus @ {t:.2f}s", "severity": _strain_from_valgus(v)})
    if max_event_l:
        t, x, y, v = max_event_l
        overlay_points.append({"x": x, "y": y, "label": f"L max valgus @ {t:.2f}s", "severity": _strain_from_valgus(v)})

    # Compose result contract used by frontend.
    strain_r = _strain_from_valgus(max_valgus_r)
    strain_l = _strain_from_valgus(max_valgus_l)
    conf = _confidence(landmarks_seen, samples)

    worst = "Right" if max_valgus_r >= max_valgus_l else "Left"
    worst_level = strain_r if worst == "Right" else strain_l

    cue = "No strong valgus-risk pattern detected."
    if worst_level != "low":
        # Prefer highest risk event cue if any.
        high = next((e for e in events if e["risk"] == "high"), None)
        mid = next((e for e in events if e["risk"] == "medium"), None)
        cue = (high or mid or events[0])["cue"] if events else cue

    summary = (
        f"CV Pose Scan: {worst} knee shows {worst_level.upper()} risk cues. "
        f"Max valgus offsets — R: {max_valgus_r:.3f}, L: {max_valgus_l:.3f}. "
        f"Cue: {cue}"
    )

    # Keep telemetry size bounded (frontend can render overlays without huge payloads).
    telemetry_payload = [
        {
            "t": round(p.t, 3),
            "frame": p.frame,
            "leftKneeAngle": None if p.leftKneeAngle is None else round(p.leftKneeAngle, 1),
            "rightKneeAngle": None if p.rightKneeAngle is None else round(p.rightKneeAngle, 1),
            "leftValgus": None if p.leftValgus is None else round(p.leftValgus, 3),
            "rightValgus": None if p.rightValgus is None else round(p.rightValgus, 3),
            "leftRisk": _risk_from_valgus(p.leftValgus),
            "rightRisk": _risk_from_valgus(p.rightValgus),
            "pose": {"points": pose_points_by_frame.get(p.frame)} if p.frame in pose_points_by_frame else None,
        }
        for p in telemetry[-800:]  # cap
    ]

    # If no events, provide one low-risk informational event (matches demo flow).
    if not events and telemetry:
        mid = telemetry[len(telemetry) // 2]
        events.append(
            {
                "id": "E-1",
                "side": "N/A",
                "risk": "low",
                "cue": "No strong valgus-risk pattern",
                "ic": round(mid.t, 2),
                "t": round(mid.t, 2),
            }
        )

    return {
        "summary": summary,
        "detectedMuscles": [
            {"name": "Right Knee", "strain": strain_r, "confidence": round(conf, 2)},
            {"name": "Left Knee", "strain": strain_l, "confidence": round(conf, 2)},
        ],
        "overlayPoints": overlay_points,
        # Optional extensions for richer UI overlays:
        "telemetry": telemetry_payload,
        "events": events[:50],
        "meta": {"fps": round(fps, 2), "totalFrames": total_frames, "sampleStep": step},
        # "annotatedVideoUrl": None,  # Future: return URL to server-rendered annotated MP4.
    }


app = FastAPI(title="InjuryIQ CV Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True}


@app.post("/analyze")
async def analyze(video: UploadFile = File(...)) -> dict[str, Any]:
    if not video:
        raise HTTPException(status_code=400, detail="Missing 'video' file")

    filename = video.filename or "upload.mp4"
    _, ext = os.path.splitext(filename)
    if ext.lower() not in {".mp4", ".mov", ".m4v", ".avi", ".webm", ".mkv"}:
        # Still attempt to process, but give a clearer message for common mistakes.
        # (Some phones upload .mov; we support that.)
        pass

    content = await video.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload")

    # Write to a temp file because OpenCV expects a filesystem path.
    with tempfile.NamedTemporaryFile(prefix="injuryiq_", suffix=ext or ".mp4", delete=False) as f:
        f.write(content)
        tmp_path = f.name

    try:
        return run_pose_cv_analysis(tmp_path)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

