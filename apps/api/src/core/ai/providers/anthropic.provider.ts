import type {
  AIProvider,
  AICompletionResponse,
  AIStreamChunk,
} from "../interfaces/provider.interface";

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly defaultModel: string;

  constructor(_apiKey: string, model: string) {
    this.defaultModel = model;
  }

  async generate(): Promise<AICompletionResponse> {
    throw new Error(
      "Anthropic provider is not yet implemented. Use DeepSeek instead.",
    );
  }

  // eslint-disable-next-line require-yield
  async *stream(): AsyncGenerator<AIStreamChunk> {
    throw new Error(
      "Anthropic provider streaming is not yet implemented.",
    );
  }

  countTokens(): number {
    return 0;
  }

  estimateCost(): number {
    return 0;
  }
}
