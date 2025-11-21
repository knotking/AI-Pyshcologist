
import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackData, TranscriptionEntry } from "../types";

export async function generateFeedback(transcript: TranscriptionEntry[], skill: string): Promise<FeedbackData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Convert transcript array to a readable string
  const conversationText = transcript
    .map(t => `${t.speaker.toUpperCase()}: ${t.text}`)
    .join('\n');

  const prompt = `
    You are a senior technical hiring manager. Review the following interview transcript for the skill: "${skill}".
    
    Transcript:
    ${conversationText}

    Provide a structured evaluation of the candidate's performance.
    1. Assign a score from 0 to 100 based on technical accuracy, clarity, and depth.
    2. List 3 key strengths.
    3. List 3 areas for improvement.
    4. Provide 2 specific learning recommendations (topics or resources).
    5. Write a brief executive summary (2 sentences).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { text: prompt },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
        },
        required: ["score", "strengths", "improvements", "recommendations", "summary"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as FeedbackData;
  }

  throw new Error("Failed to generate feedback");
}
