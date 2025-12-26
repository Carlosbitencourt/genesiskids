
import { GoogleGenAI, Type } from "@google/genai";

// Note: In Vite, we use import.meta.env to access environment variables.
// The variable must be prefixed with VITE_ to be exposed to the client.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getStyleDescription = (ageRange: string) => {
  switch (ageRange) {
    case '1-3': return "Style: Baby cartoon, extremely soft rounded shapes, pastel primary colors, simple backgrounds, Teletubbies vibe.";
    case '3-5': return "Style: Toddler 3D animation, big eyes, bright colors, friendly atmosphere, Paw Patrol visual complexity.";
    case '5-8': return "Style: Disney/Pixar 3D animation style, vibrant, expressive, magical lighting.";
    case '8-10': return "Style: 3D anime, clear details, heroic poses, engaging action.";
    case '10-13': return "Style: Pre-teen 3D anime, cool aesthetics, detailed environments, Kingdom Hearts style.";
    case '13-15': return "Style: High quality 3D anime render, dramatic lighting, detailed character design, Genshin Impact aesthetic.";
    default: return "Style: Child-friendly 3D anime, Disney/Pixar style.";
  }
};

export const generateBiblicalAnimeImage = async (userPrompt: string, ageRange: string): Promise<string | null> => {
  try {
    const styleDescription = getStyleDescription(ageRange);
    const enhancedPrompt = `
      Create a 3D anime style illustration.
      Target Audience Age: ${ageRange} years old.
      Subject: ${userPrompt}.
      ${styleDescription}
      Theme: Biblical, Wholesome, Safe. No text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: enhancedPrompt }] },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generateStoryScenes = async (storyIdea: string): Promise<{ scenes: { title: string, prompt: string }[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transforme esta ideia de história bíblica em 3 cenas visuais curtas para crianças. 
      Ideia: "${storyIdea}"
      Retorne um JSON com um array de objetos chamado "scenes", cada um com "title" (título da cena) e "prompt" (descrição visual detalhada em inglês para um gerador de imagem).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["title", "prompt"]
              }
            }
          },
          required: ["scenes"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating scenes:", error);
    throw error;
  }
};
