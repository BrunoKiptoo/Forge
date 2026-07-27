import OpenAI from "openai";
import { AIProvider, AICompletionRequest, AICompletionResponse, AIStreamChunk } from "../interfaces/provider.interface";
import { TokenCounter } from "../token-counter";

export class DeepSeekProvider implements AIProvider {
  readonly name = "deepseek";
  readonly defaultModel: string;
  private client: OpenAI;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.defaultModel = model;
    this.client = new OpenAI({
      apiKey: apiKey || "sk-placeholder",
      baseURL: baseUrl || "https://api.deepseek.com",
    });
  }

  async generate(request: AICompletionRequest): Promise<AICompletionResponse> {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: request.model ?? this.defaultModel,
      messages: request.messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      })),
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 4096,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content ?? "";

    return {
      content,
      model: response.model ?? this.defaultModel,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      duration,
    };
  }

  async *stream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: request.model ?? this.defaultModel,
      messages: request.messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      })),
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      yield { content, done: false };
    }

    yield { content: "", done: true };
  }

  countTokens(text: string): number {
    return TokenCounter.estimate(text);
  }

  estimateCost(request: AICompletionRequest): number {
    const inputTokens = TokenCounter.estimateMessages(request.messages);
    // Rough estimate: output ~= input for cost projection
    return ((inputTokens * 2) / 1000) * 0.00014;
  }
}
