import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getEmbeddings(text: string | any) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Input must be a non-empty string");
    }

    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    const cleanedText = text.replace(/\n/g, " ").trim();

    if (!cleanedText) {
      throw new Error("Cleaned text is empty");
    }

    const response = await model.embedContent(cleanedText);

    return response.embedding;
  } catch (error) {
    console.error("Error calling Gemini embeddings API:", error);

    if (error instanceof TypeError) {
      throw new Error(`Invalid input type: ${typeof text}. Expected string.`);
    }

    throw error;
  }
}
