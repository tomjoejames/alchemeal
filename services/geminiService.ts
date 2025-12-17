import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe, UserPreferences, DishSuggestion } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// Note: In a real production app, you might proxy this through a backend to protect the key,
// but for this client-side demo, we use the env variable directly as per instructions.
const ai = new GoogleGenAI({ apiKey });

export const generateRecipe = async (prefs: UserPreferences): Promise<Recipe> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Create a unique, delicious recipe based on the following user request:
    - User Input (Dish Name or Ingredients): ${prefs.ingredients}
    - Cuisine Style: ${prefs.cuisine}
    - Dietary Restrictions/Preferences: ${prefs.restrictions || "None"}
    - Time Available: ${prefs.timeAvailable} minutes
    - Servings: ${prefs.servings} people
    - Maximum Budget: ₹${prefs.maxCost} INR
    - Cooking Method: ${prefs.cookingMethod} (STRICTLY FOLLOW THIS. If Fireless, do not use any heat source).
    - Output Language: ${prefs.language}

    The recipe should be formatted as structured JSON.
    
    Instruction:
    1. If the 'User Input' is a specific dish name (e.g. "Pasta Carbonara"), generate a recipe for that specific dish.
    2. If the 'User Input' is a list of ingredients, create a recipe that uses those ingredients.
    3. Generate ALL text content (Title, Description, Instructions, Ingredient Items) in ${prefs.language}. 
    4. Keep the JSON property keys (e.g. 'title', 'instructions') strictly in English. Only the values should be translated.
    ${prefs.includeNutrition === false ? "5. Do NOT generate nutrition data." : ""}
  `;

  // Define base properties
  const properties: {[key: string]: Schema} = {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    prepTime: { type: Type.STRING },
    cookTime: { type: Type.STRING },
    servings: { type: Type.NUMBER },
    estimatedCost: { type: Type.STRING, description: "Estimated cost range in INR, e.g. '₹200-300'" },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          amount: { type: Type.STRING }
        }
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    cookingMethod: { type: Type.STRING },
    emoji: { type: Type.STRING, description: "A single emoji representing the dish" }
  };

  // Conditionally add nutrition to schema
  if (prefs.includeNutrition !== false) {
    properties.nutrition = {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING }
      }
    };
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction: "You are a world-class chef specializing in creative home cooking. You must output strictly valid JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: properties
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  const data = JSON.parse(response.text);
  
  return {
    ...data,
    id: crypto.randomUUID()
  };
};

export const getDishSuggestions = async (dietProfile: string, language: string): Promise<DishSuggestion[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Suggest 1 distinct, creative dish name for a user with this dietary profile: "${dietProfile}".
    Language for output: ${language}.
    
    Provide the response in JSON array format containing exactly 1 item.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the dish" },
            description: { type: Type.STRING, description: "Short appetizing description (max 15 words)" },
            matchReason: { type: Type.STRING, description: "Why this fits the diet (very brief)" }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No suggestions generated");
  }

  return JSON.parse(response.text);
};