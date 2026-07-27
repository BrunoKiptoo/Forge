import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { AIModule } from "../../core/ai/ai.module";
import { PlannerService } from "./planner.service";
import { ExecutionPlanRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, AIModule],
  providers: [PlannerService, ExecutionPlanRepository],
  exports: [PlannerService],
})
export class PlannerModule {}
