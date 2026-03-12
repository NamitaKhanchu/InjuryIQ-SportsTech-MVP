import { getGeminiAI } from './gemini';
import { Athlete } from '../types';

export const generatePrescription = async (athlete: Athlete, bodyPart: string): Promise<string> => {
  const ai = getGeminiAI();
  const prompt = `
    As an AI Sports Medicine expert for InjuryIQ, generate a plain-language coaching prescription for a youth athlete.
    
    Athlete: ${athlete.name}
    Age: ${athlete.age}
    Position: ${athlete.position}
    Current Status: ${athlete.status}
    HRV: ${athlete.hrv}
    Body Part of Concern: ${bodyPart}
    
    Provide a concise, actionable prescription in this format:
    "[Athlete Name]: [Risk Level] risk of [Injury Type]. Recommended: [Specific Action]"
    
    Focus on youth safety and overuse prevention. Avoid medical jargon.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || `${athlete.name}: MODERATE risk of strain. Recommended: Reduce intensity and focus on mobility.`;
  } catch (error) {
    console.error("Error generating prescription:", error);
    return `${athlete.name}: MODERATE risk of strain. Recommended: Reduce intensity and focus on mobility.`;
  }
};
