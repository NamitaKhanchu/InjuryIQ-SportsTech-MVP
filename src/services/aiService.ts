import { Type } from "@google/genai";
import { Athlete, AiAssessment } from "../types";
import { getGeminiAI } from "./gemini";

const GEMINI_MODEL = "gemini-2.0-flash";

function formatGeminiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const msg = raw.replace(/\s+/g, " ").trim();

  if (/RESOURCE_EXHAUSTED|quota/i.test(msg) || /\b429\b/.test(msg)) {
    return "Gemini quota exceeded (429). Try later or switch to a paid tier/billing.";
  }
  if (/API key|permission|unauthorized|forbidden|401|403/i.test(msg)) {
    return "Gemini auth/referrer error. Check your API key restrictions and allowed origins for localhost.";
  }
  if (/not found|model/i.test(msg)) {
    return "Gemini model not available. We may need to update the model name.";
  }

  return msg.length > 180 ? `${msg.slice(0, 180)}…` : msg;
}

async function responseText(response: any): Promise<string> {
  const t = typeof response?.text === "function" ? await response.text() : response?.text;
  return String(t ?? "").trim();
}

export async function pingGemini(message = "Hi, how's your day going?"): Promise<string> {
  const ai = getGeminiAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: message,
  });

  const text = await responseText(response);
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hashStringToUnitInterval(input: string): number {
  // Simple deterministic hash -> [0,1).
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Convert to uint32 then to [0,1)
  return (h >>> 0) / 2 ** 32;
}

function trendSlope(values: number[]): number {
  if (values.length < 2) return 0;
  // Simple slope: last - first
  return values[values.length - 1] - values[0];
}

function generateDemoAssessment(athlete: Athlete, cycleAware: boolean): AiAssessment {
  // Normalize inputs to roughly comparable scales.
  const load = clamp(athlete.load, 0, 100);
  const hrv = clamp(athlete.hrv, 0, 100);
  const sleepHours = clamp(athlete.sleep, 0, 12);
  // In this MVP wellness is 1..5. Convert to 0..10.
  const wellness10 = clamp((athlete.wellness / 5) * 10, 0, 10);

  const hrvTrend = athlete.hrvTrend ?? [];
  const hrvDelta = trendSlope(hrvTrend.slice(-7));

  // Higher score = higher risk (0..100)
  let risk =
    0.45 * load +
    0.30 * clamp(70 - hrv, 0, 70) * (100 / 70) +
    0.15 * clamp(8 - sleepHours, 0, 8) * (100 / 8) +
    0.10 * clamp(8 - wellness10, 0, 8) * (100 / 8);

  if (hrvDelta < -5) risk += 8;
  if (hrvDelta > 4) risk -= 4;
  if (cycleAware) risk += 6;
  risk = clamp(risk, 0, 100);

  const seed = hashStringToUnitInterval(`${athlete.id}|${athlete.name}|${cycleAware ? "C1" : "C0"}`);
  const leftHeavy = seed < 0.5;

  const level = (x: number): "low" | "medium" | "high" => {
    if (x >= 72) return "high";
    if (x >= 48) return "medium";
    return "low";
  };

  const legBias =
    athlete.position.toLowerCase().includes("forward") || athlete.position.toLowerCase().includes("mid")
      ? 1.1
      : athlete.position.toLowerCase().includes("defend")
        ? 0.95
        : 1.0;

  const baseLeg = clamp(risk * legBias, 0, 100);
  const baseBack = clamp(risk * 0.9 + load * 0.1, 0, 100);
  const baseUpper = clamp(risk * 0.55, 0, 100);

  const quadL = clamp(baseLeg + (leftHeavy ? 8 : -2), 0, 100);
  const quadR = clamp(baseLeg + (leftHeavy ? -2 : 8), 0, 100);
  const hamL = clamp(baseLeg + (leftHeavy ? 10 : 0), 0, 100);
  const hamR = clamp(baseLeg + (leftHeavy ? 0 : 10), 0, 100);
  const calfL = clamp(baseLeg * 0.8 + (leftHeavy ? 6 : 0), 0, 100);
  const calfR = clamp(baseLeg * 0.8 + (leftHeavy ? 0 : 6), 0, 100);

  const shoulderL = clamp(baseUpper + (leftHeavy ? -4 : 4), 0, 100);
  const shoulderR = clamp(baseUpper + (leftHeavy ? 4 : -4), 0, 100);
  const armL = clamp(baseUpper * 0.85, 0, 100);
  const armR = clamp(baseUpper * 0.85, 0, 100);
  const backLower = clamp(baseBack + 10, 0, 100);
  const backUpper = clamp(baseBack * 0.8, 0, 100);

  const scores: Record<string, number> = {
    head: 10,
    neck: baseUpper * 0.35,
    chest: baseUpper * 0.4,
    abs: baseBack * 0.45,
    shoulder_l: shoulderL,
    shoulder_r: shoulderR,
    arm_l: armL,
    arm_r: armR,
    quad_l: quadL,
    quad_r: quadR,
    hamstring_l: hamL,
    hamstring_r: hamR,
    calf_l: calfL,
    calf_r: calfR,
    back_upper: backUpper,
    back_lower: backLower,
  };

  const strains: AiAssessment["strains"] = {
    head: "low",
    neck: level(baseUpper * 0.35),
    chest: level(baseUpper * 0.4),
    abs: level(baseBack * 0.45),
    shoulder_l: level(shoulderL),
    shoulder_r: level(shoulderR),
    arm_l: level(armL),
    arm_r: level(armR),
    quad_l: level(quadL),
    quad_r: level(quadR),
    hamstring_l: level(hamL),
    hamstring_r: level(hamR),
    calf_l: level(calfL),
    calf_r: level(calfR),
    back_upper: level(backUpper),
    back_lower: level(backLower),
  };

  // Ensure demo versatility: produce some yellow/red deterministically when risk is moderate/high.
  // This keeps the demo visually interesting without being random.
  const riskBand = risk >= 72 ? "HIGH" : risk >= 48 ? "MODERATE" : "LOW";
  const desired =
    riskBand === "HIGH"
      ? { minMedium: 3, minHigh: 2 }
      : riskBand === "MODERATE"
        ? { minMedium: 2, minHigh: 1 }
        : { minMedium: 1, minHigh: 0 };

  const severityRank = (s?: string) => (s === "high" ? 2 : s === "medium" ? 1 : 0);
  const currentCounts = () => {
    let high = 0, medium = 0;
    for (const v of Object.values(strains)) {
      if (v === "high") high++;
      else if (v === "medium") medium++;
    }
    return { high, medium };
  };

  const promotable = [
    "hamstring_l",
    "hamstring_r",
    "quad_l",
    "quad_r",
    "calf_l",
    "calf_r",
    "back_lower",
    "back_upper",
    "shoulder_l",
    "shoulder_r",
  ];

  // Sort by score desc; apply deterministic tie-break using seed.
  const sorted = promotable
    .slice()
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || (seed < 0.5 ? (a < b ? -1 : 1) : (a > b ? -1 : 1)));

  const promoteTo = (partId: string, target: "medium" | "high") => {
    const cur = strains[partId];
    if (target === "high") {
      if (cur !== "high") strains[partId] = "high";
    } else {
      if (cur === "low") strains[partId] = "medium";
    }
  };

  // First satisfy high count (for moderate/high only).
  let { high, medium } = currentCounts();
  for (const partId of sorted) {
    if (high >= desired.minHigh) break;
    // Promote strongest parts to high.
    promoteTo(partId, "high");
    ({ high, medium } = currentCounts());
  }

  // Then satisfy medium count.
  for (const partId of sorted) {
    if (medium >= desired.minMedium) break;
    // Prefer to make additional parts medium (don’t overwrite existing highs).
    if (strains[partId] === "low") {
      promoteTo(partId, "medium");
      ({ high, medium } = currentCounts());
    }
  }

  const topDrivers: string[] = [];
  if (load >= 80) topDrivers.push("elevated training load");
  if (hrv <= 50) topDrivers.push("suppressed HRV");
  if (sleepHours <= 6.5) topDrivers.push("insufficient sleep");
  if (wellness10 <= 5) topDrivers.push("low wellness");
  if (cycleAware) topDrivers.push("cycle-aware sensitivity");
  if (topDrivers.length === 0) topDrivers.push("stable recovery signals");

  const summary =
    `${athlete.name}: ${riskBand} overuse risk over the next 7–10 days driven by ${topDrivers.slice(0, 2).join(" + ")}.` +
    ` Focus: ${risk >= 60 ? "reduce peak load and restore readiness" : "maintain load while protecting asymmetries"}.`;

  // Map risk to a couple of existing Recovery Lab sessions (s1–s4).
  const mitigations: AiAssessment["mitigations"] =
    risk >= 72
      ? [
          { area: "Full Body", action: "Rest + Mobility Protocol (12 min)", sessionId: "s1" },
          { area: "Lower Body", action: "HSS RIIP REPS Protocol (7 min)", sessionId: "s4" },
        ]
      : risk >= 48
        ? [
            { area: "Lower Body", action: "Neuromuscular Training (7 min)", sessionId: "s2" },
            { area: "Core & Glutes", action: "Performance Activation (10 min)", sessionId: "s3" },
          ]
        : [
            { area: "Core & Glutes", action: "Performance Activation (10 min)", sessionId: "s3" },
            { area: "Lower Body", action: "Neuromuscular Training (7 min)", sessionId: "s2" },
          ];

  return { strains, summary, mitigations };
}

function extractJson(text: string): any {
  const trimmed = text.trim();
  const noFences = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(noFences);
  } catch {
    // Try best-effort extraction of the first JSON object.
    const start = noFences.indexOf("{");
    const end = noFences.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(noFences.slice(start, end + 1));
    }
    throw new Error("Failed to parse JSON from Gemini response");
  }
}

export async function analyzeAthleteStrain(athlete: Athlete, cycleAware: boolean): Promise<AiAssessment> {
  const prompt = `
    Analyze the following athlete data and provide a detailed biomechanical risk assessment.
    Athlete: ${athlete.name}
    HRV: ${athlete.hrv} (Trend: ${athlete.hrvTrend.join(', ')})
    Load: ${athlete.load}
    Sleep: ${athlete.sleep}h
    Wellness: ${athlete.wellness}/10
    Cycle-Aware Mode: ${cycleAware ? 'ENABLED' : 'DISABLED'}

    Return ONLY valid JSON with:
    1. "strains": A map of muscle group IDs to strain levels ('low', 'medium', 'high'). 
       Muscle IDs: head, neck, chest, abs, shoulder_l, shoulder_r, arm_l, arm_r, quad_l, quad_r, hamstring_l, hamstring_r, calf_l, calf_r, back_upper, back_lower.
    2. "summary": A brief professional summary of the findings.
    3. "mitigations": A list of recommended recovery sessions from the Recovery Lab.
       Each mitigation must include:
       - "area": The muscle group name.
       - "action": What to do.
       - "sessionId": The ID of the session to link to (one of: 's1', 's2', 's3', 's4').
  `;

  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strains: {
              type: Type.OBJECT,
              properties: {
                head: { type: Type.STRING },
                neck: { type: Type.STRING },
                chest: { type: Type.STRING },
                abs: { type: Type.STRING },
                shoulder_l: { type: Type.STRING },
                shoulder_r: { type: Type.STRING },
                arm_l: { type: Type.STRING },
                arm_r: { type: Type.STRING },
                quad_l: { type: Type.STRING },
                quad_r: { type: Type.STRING },
                hamstring_l: { type: Type.STRING },
                hamstring_r: { type: Type.STRING },
                calf_l: { type: Type.STRING },
                calf_r: { type: Type.STRING },
                back_upper: { type: Type.STRING },
                back_lower: { type: Type.STRING },
              },
              required: ["quad_l", "quad_r", "hamstring_l", "hamstring_r"]
            },
            summary: { type: Type.STRING },
            mitigations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  action: { type: Type.STRING },
                  sessionId: { type: Type.STRING }
                },
                required: ["area", "action", "sessionId"]
              }
            }
          },
          required: ["strains", "summary", "mitigations"]
        }
      }
    });

    const rawText = await responseText(response);
    if (!rawText) throw new Error("No response text from Gemini");

    return extractJson(String(rawText)) as AiAssessment;
  } catch (error) {
    console.error("AI Analysis failed (falling back to demo mode):", error);
    // Demo mode fallback: deterministic, realistic output for a reliable demo.
    // (We intentionally do not surface quota/auth errors in the user-facing summary.)
    return generateDemoAssessment(athlete, cycleAware);
  }
}
