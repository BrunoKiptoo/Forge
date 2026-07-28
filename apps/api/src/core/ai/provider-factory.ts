import { Injectable } from "@nestjs/common";
import { AIProvider } from "./interfaces/provider.interface";
import { DeepSeekProvider } from "./providers/deepseek.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { GeminiProvider } from "./providers/gemini.provider";
import { GrokProvider } from "./providers/grok.provider";

@Injectable()
export class ProviderFactory {
  create(): AIProvider {
    const provider = process.env.AI_PROVIDER ?? "deepseek";
    const apiKey = process.env.AI_PROVIDER_API_KEY ?? "";
    const baseUrl = process.env.AI_PROVIDER_BASE_URL;
    const model = process.env.AI_PROVIDER_MODEL ?? "deepseek-chat";

    switch (provider) {
      case "deepseek":
        return new DeepSeekProvider(apiKey, model, baseUrl);
      case "openai":
        return new OpenAIProvider(apiKey, model);
      case "anthropic":
        return new AnthropicProvider(apiKey, model);
      case "gemini":
        return new GeminiProvider(apiKey, model);
      case "grok":
        return new GrokProvider(apiKey, model);
      default:
        return new DeepSeekProvider(apiKey, model, baseUrl);
    }
  }
}
