import { Module, Global } from "@nestjs/common";
import { ProviderFactory } from "./provider-factory";
import { AIService } from "./ai.service";
import { PromptBuilder } from "./prompt-builder";

@Global()
@Module({
  providers: [ProviderFactory, AIService, PromptBuilder],
  exports: [AIService, PromptBuilder],
})
export class AIModule {}
