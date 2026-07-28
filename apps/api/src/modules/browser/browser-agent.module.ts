import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { BrowserModule } from "../../core/browser/browser.module";
import { GatewayModule } from "../../core/gateway/gateway.module";
import { BrowserAgentService } from "./browser-agent.service";
import { BrowserController } from "./browser.controller";
import { BrowserSessionRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, BrowserModule, GatewayModule],
  controllers: [BrowserController],
  providers: [BrowserAgentService, BrowserSessionRepository],
  exports: [BrowserAgentService],
})
export class BrowserAgentModule {}
