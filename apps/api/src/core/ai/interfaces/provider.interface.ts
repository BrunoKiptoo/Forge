export interface AICompletionRequest {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration: number;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;

  generate(request: AICompletionRequest): Promise<AICompletionResponse>;
  stream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk>;
  countTokens(text: string): number;
  estimateCost(request: AICompletionRequest): number;
}
