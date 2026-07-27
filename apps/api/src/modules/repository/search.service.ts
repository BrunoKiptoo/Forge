import { Injectable, Inject } from "@nestjs/common";
import { EMBEDDING_PROVIDER } from "../../core/embeddings/embeddings.module";
import type { EmbeddingProvider } from "../../core/embeddings/interfaces/provider.interface";
import { CodeChunkRepository } from "../../core/database/repositories";

export interface SearchResult {
  chunkId: string;
  filePath: string;
  content: string;
  language: string;
  symbolName: string;
  score: number;
}

@Injectable()
export class SearchService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private readonly provider: EmbeddingProvider,
    private readonly chunkRepository: CodeChunkRepository,
  ) {}

  async search(organizationId: string, repoFullName: string, query: string, topK = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.provider.generateEmbedding(query);
    const chunks = await this.chunkRepository.findByRepo(organizationId, repoFullName);

    return chunks
      .filter((c) => c.embedding && c.embedding.length > 0)
      .map((c) => ({
        chunkId: String(c._id),
        filePath: c.filePath,
        content: c.content,
        language: c.language,
        symbolName: c.symbolName ?? "",
        score: this.provider.similarity(queryEmbedding, c.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
