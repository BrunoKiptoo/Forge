import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { GatewayModule } from "../../core/gateway/gateway.module";
import { DeploymentModule } from "../deployments/deployment.module";
import { EnvironmentsController } from "./environments.controller";
import { EnvironmentsService } from "./environments.service";
import { EnvironmentRepository } from "../../core/database/repositories";
import { DeploymentRepository } from "../../core/database/repositories";
import { WorkspaceRepository } from "../../core/database/repositories";
import { ApprovalRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, GatewayModule, DeploymentModule],
  controllers: [EnvironmentsController],
  providers: [EnvironmentsService, EnvironmentRepository, DeploymentRepository, WorkspaceRepository, ApprovalRepository],
  exports: [EnvironmentsService],
})
export class EnvironmentsModule {}
