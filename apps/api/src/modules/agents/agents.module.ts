import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { AgentsController } from "./agents.controller";
import { OrchestratorModule } from "../orchestrator/orchestrator.module";
import { AgentRepository } from "../../core/database/repositories";
import { AgentExecutionRepository } from "../../core/database/repositories";
import { ExecutionPlanRepository } from "../../core/database/repositories";
import { TaskRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, OrchestratorModule],
  controllers: [AgentsController],
  providers: [AgentRepository, AgentExecutionRepository, ExecutionPlanRepository, TaskRepository],
  exports: [],
})
export class AgentsModule {}
