import { GoogleGenerativeAI } from "@google/generative-ai";

function cleanEnvValue(value: string | undefined) {
  if (!value) return undefined;
  let v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

export function getGeminiModel() {
  const apiKey = cleanEnvValue(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: cleanEnvValue(process.env.GEMINI_MODEL) || "gemini-1.5-flash",
  });
}
