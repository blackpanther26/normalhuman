import { db } from "@/server/db";
import { AnyOrama, create, insert, search } from "@orama/orama";
import { persist, restore } from "@orama/plugin-data-persistence";
import { getEmbeddings } from "./embedding";

export class OramaClient {
  //@ts-ignore
  private orama: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async saveIndex() {
    const index = await persist(this.orama, "json");
    await db.account.update({
      where: { id: this.accountId },
      data: { oramaIndex: index },
    });
  }

  async initialize() {
    const account = await db.account.findUnique({
      where: { id: this.accountId },
    });
    if (!account) {
      throw new Error("Account not found");
    }

    if (account.oramaIndex) {
      this.orama = await restore("json", account.oramaIndex as any);
    } else {
      this.orama = await create({
        schema: {
          subject: "string",
          body: "string",
          rawBody: "string",
          from: "string",
          to: "string[]",
          sentAt: "string",
          threadId: "string",
          embeddings: "vector[768]",
        },
      });
      await this.saveIndex();
    }
  }

  async search(query: string) {
    return await search(this.orama, { term: query });
  }

  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }

  async vectorSearch(prompt: string) {
    const embeddings = await getEmbeddings(prompt);

    const results = await search(this.orama, {
      mode: "hybrid",
      term: prompt,
      vector: {
        value: embeddings.values,
        property: "embeddings",
      },
      similarity: 0.8,
    });
    console.log("Vector search results:", results);
    return results;
  }
}
