import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function text2json(questions) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
      Format the following multiple-choice question text into a JSON format.
      For answer, provide the index (0-based) of the correct option from the options array.

      Questions:
      ${questions}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            answer: {
              type: Type.INTEGER,
            },
          },
          propertyOrdering: ["question", "options", "answer"],
          required: ["question", "options", "answer"],
        },
      },
    },
  });
  return JSON.parse(response.text);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }
    const formattedQuestions = await text2json(text);
    return Response.json(formattedQuestions);
  } catch (error) {
    console.error("Error processing request:", error);
    return Response.json({ error: "Failed to process questions" }, { status: 500 });
  }
}