import { AICompletionResponse } from "./interfaces/provider.interface";

export class CostTracker {
  // Cost per 1K tokens (approximate, varies by provider/model)
  private static readonly COSTS: Record<string, number> = {
    deepseek: 0.00014,   // $0.14/1M tokens → $0.00014/1K
    openai: 0.002,       // $2/1M tokens → $0.002/1K (gpt-4o-mini)
    anthropic: 0.003,    // $3/1M tokens
    gemini: 0.00025,     // $0.25/1M tokens
    grok: 0.002,         // $2/1M tokens
  };

  static estimateCost(provider: string, promptTokens: number, completionTokens: number): number {
    const costPer1K = CostTracker.COSTS[provider] ?? 0.001;
    return ((promptTokens + completionTokens) / 1000) * costPer1K;
  }

  static createMetadata(
    provider: string,
    model: string,
    response: AICompletionResponse,
  ): Record<string, unknown> {
    const cost = CostTracker.estimateCost(provider, response.usage.promptTokens, response.usage.completionTokens);
    return {
      provider,
      model,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      duration: response.duration,
      estimatedCost: cost,
    };
  }
}
