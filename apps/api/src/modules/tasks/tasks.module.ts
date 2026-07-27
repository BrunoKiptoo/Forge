import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { TaskRepository } from "../../core/database/repositories";
import { TaskExecutionRepository } from "../../core/database/repositories";
import { ActivityRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";
import { ApprovalsModule } from "../approvals/approvals.module";

@Module({
  imports: [DatabaseModule, ApprovalsModule],
  controllers: [TasksController],
  providers: [TasksService, TaskRepository, TaskExecutionRepository, ActivityRepository, ArtifactRepository],
  exports: [TasksService],
})
export class TasksModule {}
