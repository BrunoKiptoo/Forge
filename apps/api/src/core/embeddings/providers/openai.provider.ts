import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import type { EmbeddingProvider } from "../interfaces/provider.interface";

@Injectable()
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = "openai";
  readonly dimensions = 1536;
  private _client: OpenAI | null = null;
  private model = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";

  private get client(): OpenAI {
    if (!this._client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
      this._client = new OpenAI({ apiKey });
    }
    return this._client;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const res = await this.client.embeddings.create({
      model: this.model,
      input: text.slice(0, 8000),
    });
    return res.data[0]!.embedding;
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const res = await this.client.embeddings.create({
      model: this.model,
      input: texts.map((t) => t.slice(0, 8000)),
    });
    return res.data.map((d) => d.embedding);
  }

  similarity(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!;
      na += a[i]! * a[i]!;
      nb += b[i]! * b[i]!;
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom > 0 ? dot / denom : 0;
  }
}
