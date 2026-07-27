import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { OrchestratorService } from "./orchestrator.service";
import { PlannerModule } from "../planner/planner.module";
import { RepositoryModule } from "../repository/repository.module";
import { SandboxModule } from "../../core/sandbox/sandbox.module";
import { GatewayModule } from "../../core/gateway/gateway.module";
import { BrowserAgentModule } from "../browser/browser-agent.module";
import { AgentRepository } from "../../core/database/repositories";
import { ExecutionPlanRepository } from "../../core/database/repositories";
import { AgentExecutionRepository } from "../../core/database/repositories";
import { ActivityRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";
import { AgentMessageRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, PlannerModule, RepositoryModule, SandboxModule, GatewayModule, BrowserAgentModule],
  providers: [
    OrchestratorService,
    AgentRepository,
    ExecutionPlanRepository,
    AgentExecutionRepository,
    ActivityRepository,
    ArtifactRepository,
    AgentMessageRepository,
  ],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
