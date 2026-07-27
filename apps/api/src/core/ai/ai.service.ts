import { Injectable } from "@nestjs/common";
import { ProviderFactory } from "./provider-factory";
import { AIProvider, AICompletionResponse, AIStreamChunk } from "./interfaces/provider.interface";

@Injectable()
export class AIService {
  private provider: AIProvider;

  constructor(private readonly providerFactory: ProviderFactory) {
    this.provider = this.providerFactory.create();
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  async generate(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<AICompletionResponse> {
    return this.provider.generate({
      messages,
      model: this.provider.defaultModel,
      temperature: options?.temperature ?? 0.3,
      maxTokens: options?.maxTokens ?? 4096,
    });
  }

  async *stream(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options?: { temperature?: number; maxTokens?: number },
  ): AsyncGenerator<AIStreamChunk> {
    yield* this.provider.stream({
      messages,
      model: this.provider.defaultModel,
      temperature: options?.temperature ?? 0.3,
      maxTokens: options?.maxTokens ?? 4096,
    });
  }

  estimateCost(messages: { role: "system" | "user" | "assistant"; content: string }[]): number {
    return this.provider.estimateCost({ messages });
  }
}
