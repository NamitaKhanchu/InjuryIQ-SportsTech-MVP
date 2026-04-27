export type CvStrainLevel = 'low' | 'medium' | 'high';

export type CvDetectedMuscle = {
  name: string;
  strain: CvStrainLevel;
  confidence?: number;
};

// Marker for overlaying points on the video.
// If x/y are between 0..1 they are treated as normalized coordinates.
export type CvOverlayPoint = {
  x: number;
  y: number;
  label?: string;
  severity?: CvStrainLevel;
};

export type CvAnalysisResult = {
  summary: string;
  detectedMuscles: CvDetectedMuscle[];
  overlayPoints?: CvOverlayPoint[];
  annotatedVideoUrl?: string;
  telemetry?: Array<{
    t: number;
    frame: number;
    leftKneeAngle?: number | null;
    rightKneeAngle?: number | null;
    leftValgus?: number | null;
    rightValgus?: number | null;
    leftRisk?: CvStrainLevel | null;
    rightRisk?: CvStrainLevel | null;
    pose?: { points: Array<{ x: number; y: number; v?: number }> } | null;
  }>;
  events?: Array<{
    id: string;
    risk: CvStrainLevel;
    cue: string;
    ic: number;
    t: number;
    side?: string;
  }>;
  meta?: Record<string, unknown>;
};

export async function analyzeCvVideo(file: File): Promise<CvAnalysisResult> {
  const form = new FormData();
  // Common field name used by many Node upload handlers (multer/busboy).
  form.append('video', file, file.name);

  const res = await fetch('/cv/analyze', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CV backend error (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as unknown;
  return data as CvAnalysisResult;
}

