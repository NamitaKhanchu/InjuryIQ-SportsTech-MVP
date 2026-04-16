import { GoogleGenAI } from "@google/genai";

export const getGeminiAI = () => {
  // Vite/browser-safe env access + backward compatibility with the AI Studio export.
  const env = (import.meta as any)?.env ?? {};
  const apiKey =
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    // This exact expression is replaced at build time by `vite.config.ts` define.
    process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set (set GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env.local)");
  }
  return new GoogleGenAI({ apiKey });
};
