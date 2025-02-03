import { auth } from "@clerk/nextjs/server";
import { OramaClient } from "@/lib/orama";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type HitDocument = { [key: string]: any };

type VectorSearchResult = {
  hits: Array<{
    document: HitDocument;
  }>;
};

type SearchResult = never[] | VectorSearchResult;

export async function POST(req: Request) {
  let requestBody;

  try {
    requestBody = await req.json();
  } catch (error) {
    console.error("Failed to read request body:", error);
    return new Response("Invalid request body", { status: 400 });
  }

  try {
    const { accountId, messages } = requestBody;

    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const orama = new OramaClient(accountId);
    await orama.initialize();

    const lastMessage = messages[messages.length - 1];

    const context: SearchResult = await orama.vectorSearch(lastMessage.content);

    if (
      !context ||
      !("hits" in context) ||
      !Array.isArray(context.hits) ||
      context.hits.length === 0
    ) {
      return new Response(
        JSON.stringify({
          role: "assistant",
          content: "No relevant information found in the email context.",
          id: Date.now().toString(),
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Build the prompt using context and the last message
    const prompt = `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
    THE TIME NOW IS ${new Date().toLocaleString()}

    START CONTEXT BLOCK
    ${context.hits.map((hit) => JSON.stringify(hit.document)).join("\n")}
    END OF CONTEXT BLOCK

    USER QUESTION: ${lastMessage.content}

    When responding, please keep in mind:
    - Be helpful, clever, and articulate.
    - Rely on the provided email context to inform your responses.
    - If the context does not contain enough information to answer a question, politely say you don't have enough information.
    - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
    - Do not invent or speculate about anything that is not directly supported by the email context.
    - Keep your responses concise and relevant to the user's questions or the email being composed.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const textResponse =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: "assistant",
        content: textResponse,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in AI response:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
