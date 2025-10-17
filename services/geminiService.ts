
import { GoogleGenAI } from "@google/genai";

export const generateRtSuggestion = async (topic: string): Promise<string> => {
    try {
        // FIX: Per coding guidelines, assume API_KEY is present in the environment.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, engaging, tweet-style post about "${topic}". Keep it under 280 characters. Use a few relevant hashtags.`,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating rt suggestion:", error);
        throw new Error("Failed to generate suggestion from AI.");
    }
};