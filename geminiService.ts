import { GoogleGenAI, Modality } from "@google/genai";

export const getGenAIInstance = () => {
  const apiKey = localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add it in Settings.');
  }
  return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string, model = "gemini-2.5-flash") => {
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
    model: "gemini-2.5-flash-image",
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
}