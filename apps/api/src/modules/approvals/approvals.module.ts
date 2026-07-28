import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { GatewayModule } from "../../core/gateway/gateway.module";
import { ApprovalsController } from "./approvals.controller";
import { ApprovalsService } from "./approvals.service";
import { ApprovalRepository } from "../../core/database/repositories";
import { TaskRepository } from "../../core/database/repositories";
import { EnvironmentRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, GatewayModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, ApprovalRepository, TaskRepository, EnvironmentRepository],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
