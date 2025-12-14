
import { GoogleGenAI, Modality } from "@google/genai";
import { LearningPath } from "./types";
import { GEMINI_PRO_MODEL, GEMINI_IMAGE_MODEL, GEMINI_LIVE_MODEL } from "./constants";

export const getGenAIInstance = () => {
  const apiKey = localStorage.getItem("gemini_api_key") || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string, model = GEMINI_PRO_MODEL) => {
  const ai = getGenAIInstance();
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });
  return { text: response.text || "" };
};

export const generateImage = async (prompt: string, config: any = {}) => {
  const ai = getGenAIInstance();
  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: config }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateAudio = async (text: string) => {
  const ai = getGenAIInstance();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

export class GeminiService {
  async runCodeSimulation(code: string, language: string): Promise<string> {
    const prompt = `Simulate the execution of this ${language} code and capture the output. \n\nCode:\n${code}\n\nOutput:`;
    const { text } = await generateText(prompt);
    return text;
  }

  async generateLearningPaths(subject: string): Promise<LearningPath[]> {
     const prompt = `Create a learning path for "${subject}". Return JSON. Schema: Array of { id, title, description, topics: Array of { id, title, description, lessons: Array of { id, title, topic } } }.`;
     const ai = getGenAIInstance();
     const response = await ai.models.generateContent({
        model: GEMINI_PRO_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
     });
     try {
         const data = JSON.parse(response.text || "[]");
         return Array.isArray(data) ? data : [data];
     } catch (e) {
         console.error(e);
         return [];
     }
  }
}
