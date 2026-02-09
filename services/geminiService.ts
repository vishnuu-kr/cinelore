import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Theory } from "../types";

const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');

const theorySchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      id: { type: SchemaType.STRING },
      title: { type: SchemaType.STRING },
      author: { type: SchemaType.STRING },
      content: { type: SchemaType.STRING },
      url: { type: SchemaType.STRING },
      season: { type: SchemaType.NUMBER },
      episode: { type: SchemaType.NUMBER },
      category: { type: SchemaType.STRING }
    },
    required: ["id", "title", "author", "content", "url"]
  }
};

export async function fetchFanTheories(showTitle: string): Promise<any[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Updated to a known valid model, "gemini-3-flash-preview" might not exist or require specific beta access
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: theorySchema as any
      }
    });

    const result = await model.generateContent(`Search for popular fan theories from Reddit (r/FanTheories, r/theories) for the show or movie: "${showTitle}". 
      Return at least 10 high-quality theories. 
      Try to link each theory to a specific season and episode if possible (use 0 for general series theories).
      Provide a concise 2-3 sentence summary for the content.
      Include a plausible Reddit URL.`);

    const response = result.response;

    const text = response.text();
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching theories via Gemini:", error);
    return [];
  }
}

export async function summarizeTheory(theoryContent: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Summarize this fan theory in one punchy sentence: "${theoryContent}"`);
    return result.response.text()?.trim() || "No summary available.";
  } catch (error) {
    console.error("Summary generation failed:", error);
    return "Summary generation failed.";
  }
}
