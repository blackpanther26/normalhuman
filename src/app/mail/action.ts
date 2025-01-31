"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createStreamableValue } from "ai/rsc";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateEmail(prompt: string, context: string) {
  const stream = createStreamableValue();

  (async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContentStream(
        `Write a professional email based on the following details:
        
        Context: ${context}
        Purpose: ${prompt}
  
        Ensure the email includes a subject line, greeting, body, and closing, and maintains a professional tone.`
      );

      for await (const chunk of result.stream) {
        stream.update(chunk.text());
      }

      stream.done();
    } catch (error) {
      console.error("Error generating email:", error);
      stream.done();
    }
  })();

  return { output: stream.value };
}

export async function generateEmailAutocomplete(partialText: string) {
  const stream = createStreamableValue();

  (async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContentStream(`
        Continue writing the following professional email:

        Partial Email: ${partialText}

        Ensure the completion is relevant, professional, and flows naturally.
      `);

      for await (const chunk of result.stream) {
        stream.update(chunk.text());
      }

      stream.done();
    } catch (error) {
      console.error("Error generating email autocomplete:", error);
      stream.done();
    }
  })();

  return { output: stream.value };
}
