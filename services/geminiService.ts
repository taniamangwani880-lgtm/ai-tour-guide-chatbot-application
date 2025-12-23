
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message, UserPreferences, LocationState, GroundingLink } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const chatWithGuide = async (
  message: string,
  history: Message[],
  preferences: UserPreferences,
  location: LocationState
): Promise<{ text: string; links: GroundingLink[] }> => {
  try {
    const formattedHistory = history.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Inject preferences and location into system instruction or current message
    const contextPrompt = `
[User Context]
Current Location: ${location.address} ${location.lat ? `(Lat: ${location.lat}, Lng: ${location.lng})` : ''}
Traveler Preferences: Budget: ${preferences.budget}, Style: ${preferences.travelStyle}, Interests: ${preferences.interests.join(', ')}

[User Message]
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: contextPrompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location.lat && location.lng ? {
              latitude: location.lat,
              longitude: location.lng
            } : undefined
          }
        }
      },
    });

    const text = response.text || "I'm sorry, I couldn't generate a guide for you right now.";
    
    // Extract grounding links
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          links.push({ title: chunk.maps.title, uri: chunk.maps.uri });
        } else if (chunk.web) {
          links.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return { text, links };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "Oops! My guide connection seems a bit lost. Please try again.", 
      links: [] 
    };
  }
};
