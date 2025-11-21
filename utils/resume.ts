
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysis } from "../types";

export async function analyzeResume(fileBase64: string, mimeType: string): Promise<ResumeAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the provided resume. 
    1. Create a short text summary (max 3 sentences) of the candidate's experience level and main focus.
    2. Extract a list of up to 8 distinct technical skills or competencies mentioned in the resume that would be good topics for a technical interview.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          skills: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          }
        },
        required: ["summary", "skills"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ResumeAnalysis;
  }
  
  throw new Error("Failed to analyze resume");
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
