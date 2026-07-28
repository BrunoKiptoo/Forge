import { Injectable, Inject } from "@nestjs/common";
import { EMBEDDING_PROVIDER } from "../../core/embeddings/embeddings.module";
import type { EmbeddingProvider } from "../../core/embeddings/interfaces/provider.interface";
import { CodeChunkRepository } from "../../core/database/repositories";

@Injectable()
export class EmbeddingsService {
  constructor(
    @Inject(EMBEDDING_PROVIDER) private readonly provider: EmbeddingProvider,
    private readonly chunkRepository: CodeChunkRepository,
  ) {}

  async generateEmbeddings(organizationId: string, repoFullName: string) {
    const chunks = await this.chunkRepository.findByRepo(organizationId, repoFullName);
    if (chunks.length === 0) return { embedded: 0, provider: this.provider.name };

    const texts = chunks.map((c) => c.content);
    const embeddings = await this.provider.generateEmbeddings(texts);

    for (let i = 0; i < chunks.length; i++) {
      await this.chunkRepository.updateEmbedding(String(chunks[i]!._id), embeddings[i]!);
    }

    return { embedded: chunks.length, provider: this.provider.name, dimensions: this.provider.dimensions };
  }

  getDimensions(): number {
    return this.provider.dimensions;
  }

  getProviderName(): string {
    return this.provider.name;
  }
}
