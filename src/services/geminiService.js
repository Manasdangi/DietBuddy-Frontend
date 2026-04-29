import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system/legacy';

// Read the API key from environment variables (configured in .env file)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";

const genAI = new GoogleGenerativeAI(API_KEY);

const systemPrompt = `
You are a highly capable AI nutrition assistant. 
Analyze the provided user input (image of food, audio describing food, or text description).
Identify all food items, and estimate their nutritional values.
If audio is provided, please also provide a transcript of what the user said.
Return the result strictly as a valid JSON object matching this schema:
{
  "transcription": "string (transcript of the audio, or empty string)",
  "foodName": "string (comma separated list of identified items)",
  "macros": {
    "calories": number,
    "protein": number (in grams),
    "carbs": number (in grams)
  },
  "confidence": "string (high, medium, low)",
  "notes": "string (any helpful tip or warning)"
}
Do not return any markdown formatting, just the raw JSON object.
`;

export const analyzeDietInput = async (uri, mimeType, type = 'image') => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptContent = [systemPrompt];

    // If there's a file attached
    if (uri && mimeType) {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      promptContent.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      promptContent.push("Please analyze the nutritional content of the food shown or described in this media.");
    } else if (type === 'text') {
      promptContent.push("User described their meal: " + uri);
    }

    const result = await model.generateContent(promptContent);
    const responseText = result.response.text();
    
    // Parse the JSON (safely handle if model wrapped it in markdown)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```/g, '').trim();
    }

    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a mock fallback if it fails (e.g. invalid API key)
    return {
      foodName: "Mock Food (API Error)",
      macros: { calories: 500, protein: 30, carbs: 45 },
      confidence: "low",
      notes: "This is mock data because the API key might not be configured."
    };
  }
};
