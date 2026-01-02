
import { GoogleGenAI, Type } from "@google/genai";

// Note: In Vite, we use import.meta.env to access environment variables.
// The variable must be prefixed with VITE_ to be exposed to the client.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getStyleDescription = (ageRange: string) => {
  switch (ageRange) {
    case '0-12m': return "Style: Baby cartoon, extremely soft rounded shapes, pastel colors, very simple backgrounds, high contrast for infants.";
    case '1-3': return "Style: Toddler 3D animation, big eyes, bright primary colors, friendly atmosphere, Paw Patrol visual complexity.";
    case '4-6': return "Style: Disney/Pixar 3D animation style, vibrant, expressive, magical lighting, cheerful.";
    case '7-9': return "Style: 3D anime, clear details, heroic and adventurous poses, engaging action.";
    case '10-12': return "Style: Pre-teen 3D anime, cool aesthetics, detailed environments, Kingdom Hearts style.";
    case '13-16': return "Style: High quality 3D anime render, more realistic proportions but still anime style, dramatic lighting, detailed character design, Genshin Impact aesthetic.";
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

const extractText = (response: any): string => {
  if (typeof response.text === 'function') {
    try {
      return response.text();
    } catch (e) {
      // Fallback if it's a function but fails
    }
  }
  return response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

export const generateStoryScenes = async (storyIdea: string): Promise<{ scenes: { title: string, prompt: string }[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user', parts: [{
          text: `Transforme esta ideia de história bíblica em 3 cenas visuais curtas para crianças. 
      Ideia: "${storyIdea}"
      Retorne um JSON com um array de objetos chamado "scenes", cada um com "title" (título da cena) e "prompt" (descrição visual detalhada em inglês para um gerador de imagem).` }]
      }],
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

    return JSON.parse(extractText(response));
  } catch (error) {
    console.error("Error generating scenes:", error);
    throw error;
  }
};

export const generateFullBibleStory = async (topic: string, ageRange: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user', parts: [{
          text: `Escreva uma história bíblica cativante sobre "${topic}" para crianças de ${ageRange} anos. 
      A história deve ser apropriada para a idade, com uma linguagem simples e envolvente. 
      Inclua uma pequena lição moral ou reflexão ao final.
      Não use formatação markdown excessiva, apenas texto organizado em parágrafos.` }]
      }],
    });

    return extractText(response);
  } catch (error) {
    console.error("Error generating full story:", error);
    throw error;
  }
};
export const summarizeStoryFromImage = async (base64Image: string): Promise<string> => {
  try {
    // Extract base64 data and mime type
    const [mimePart, dataPart] = base64Image.split(',');
    const mimeType = mimePart.match(/:(.*?);/)?.[1] || 'image/png';
    const data = dataPart;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user',
        parts: [
          { text: "Analise esta imagem e escreva um resumo cativante da história bíblica ou do tema cristão que ela representa. Se for uma cena genérica, crie uma breve história inspiradora baseada nos elementos visuais. O texto deve ser amigável para crianças, organizado em parágrafos e sem formatação markdown excessiva." },
          { inlineData: { mimeType, data } }
        ]
      }],
    });

    return extractText(response);
  } catch (error) {
    console.error("Error summarizing story from image:", error);
    throw error;
  }
};
