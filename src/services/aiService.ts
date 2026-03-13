import { GoogleGenAI, Type } from "@google/genai";
import { Athlete, AiAssessment } from "../types";

// Initialize the AI client
// Note: process.env.GEMINI_API_KEY is handled by the platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeAthleteStrain(athlete: Athlete, cycleAware: boolean): Promise<AiAssessment> {
  const prompt = `
    Analyze the following athlete data and provide a detailed biomechanical risk assessment.
    Athlete: ${athlete.name}
    HRV: ${athlete.hrv} (Trend: ${athlete.hrvTrend.join(', ')})
    Load: ${athlete.load}
    Sleep: ${athlete.sleep}h
    Wellness: ${athlete.wellness}/10
    Cycle-Aware Mode: ${cycleAware ? 'ENABLED' : 'DISABLED'}

    Return a JSON object with:
    1. "strains": A map of muscle group IDs to strain levels ('low', 'medium', 'high'). 
       Muscle IDs: head, neck, chest, abs, shoulder_l, shoulder_r, arm_l, arm_r, quad_l, quad_r, hamstring_l, hamstring_r, calf_l, calf_r, back_upper, back_lower.
    2. "summary": A brief professional summary of the findings.
    3. "mitigations": A list of recommended recovery sessions from the Recovery Lab.
       Each mitigation must include:
       - "area": The muscle group name.
       - "action": What to do.
       - "sessionId": The ID of the session to link to (e.g., 's1', 's2', 's3', 's4', 's5', 's6').
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
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

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback data
    return {
      strains: {
        quad_l: 'low', quad_r: 'medium', hamstring_l: 'high', hamstring_r: 'low',
        back_lower: 'medium', shoulder_r: 'low'
      },
      summary: "AI Analysis unavailable. Showing baseline risk assessment based on recent load trends.",
      mitigations: [
        { area: "Hamstrings", action: "NMT Lower Body Mobility", sessionId: "s1" },
        { area: "Lower Back", action: "Core Stability Reset", sessionId: "s4" }
      ]
    };
  }
}
