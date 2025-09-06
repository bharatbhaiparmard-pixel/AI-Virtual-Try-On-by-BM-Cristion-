
import { GoogleGenAI, Modality } from "@google/genai";

const parseDataUrl = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid data URL format provided.");
  }
  return { mimeType: match[1], data: match[2] };
};

export const performVirtualTryOn = async (
  modelImage: string,
  garmentImage: string,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please configure it to use the AI service.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const modelImageData = parseDataUrl(modelImage);
  const garmentImageData = parseDataUrl(garmentImage);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: modelImageData.data,
            mimeType: modelImageData.mimeType,
          },
        },
        {
          inlineData: {
            data: garmentImageData.data,
            mimeType: garmentImageData.mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  for (const part of response.candidates[0].content.parts) {
      if (part.text) {
          throw new Error(`AI model returned a text response instead of an image: "${part.text}"`);
      }
  }

  throw new Error("No image data was found in the AI response. The model may have refused the request.");
};
