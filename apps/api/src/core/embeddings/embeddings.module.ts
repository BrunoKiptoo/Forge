import { Module } from "@nestjs/common";
import { StubEmbeddingProvider } from "./providers/stub.provider";
import { OpenAIEmbeddingProvider } from "./providers/openai.provider";
import type { EmbeddingProvider } from "./interfaces/provider.interface";

export const EMBEDDING_PROVIDER = "EMBEDDING_PROVIDER";

@Module({
  providers: [
    StubEmbeddingProvider,
    OpenAIEmbeddingProvider,
    {
      provide: EMBEDDING_PROVIDER,
      useFactory: (stub: StubEmbeddingProvider, openai: OpenAIEmbeddingProvider): EmbeddingProvider => {
        const configured = process.env.EMBEDDING_PROVIDER ?? "stub";
        if (configured === "openai" && process.env.OPENAI_API_KEY) return openai;
        return stub;
      },
      inject: [StubEmbeddingProvider, OpenAIEmbeddingProvider],
    },
  ],
  exports: [EMBEDDING_PROVIDER, StubEmbeddingProvider, OpenAIEmbeddingProvider],
})
export class EmbeddingsModule {}
