import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { PlannerModule } from "../planner/planner.module";
import { WorkspaceModule } from "../workspace/workspace.module";
import { GoalController } from "./goal.controller";
import { GoalService } from "./goal.service";
import { GoalRepository } from "../../core/database/repositories";
import { TaskRepository } from "../../core/database/repositories";
import { ActivityRepository } from "../../core/database/repositories";
import { AgentMessageRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, PlannerModule, WorkspaceModule],
  controllers: [GoalController],
  providers: [GoalService, GoalRepository, TaskRepository, ActivityRepository, AgentMessageRepository],
  exports: [GoalService],
})
export class GoalModule {}
