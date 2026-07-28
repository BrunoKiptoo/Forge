import type {
  AIProvider,
  AICompletionResponse,
  AIStreamChunk,
} from "../interfaces/provider.interface";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly defaultModel: string;

  constructor(_apiKey: string, model: string) {
    this.defaultModel = model;
  }

  async generate(): Promise<AICompletionResponse> {
    throw new Error(
      "OpenAI provider is not yet implemented. Use DeepSeek instead.",
    );
  }

  // eslint-disable-next-line require-yield
  async *stream(): AsyncGenerator<AIStreamChunk> {
    throw new Error(
      "OpenAI provider streaming is not yet implemented.",
    );
  }

  countTokens(): number {
    return 0;
  }

  estimateCost(): number {
    return 0;
  }
}
