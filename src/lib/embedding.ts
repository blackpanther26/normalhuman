import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getEmbeddings(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const response = await model.embedContent(text.replace(/\n/g, " "));
    return response.embedding;
  } catch (error) {
    console.error("Error calling Gemini embeddings API:", error);
    throw error;
  }
}
