import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { DeployModule } from "../../core/deploy/deploy.module";
import { GatewayModule } from "../../core/gateway/gateway.module";
import { DeploymentController } from "./deployment.controller";
import { DeploymentService } from "./deployment.service";
import { DeploymentRepository } from "../../core/database/repositories";
import { WorkspaceRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";

import { EnvironmentRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, DeployModule, GatewayModule],
  controllers: [DeploymentController],
  providers: [DeploymentService, DeploymentRepository, WorkspaceRepository, ArtifactRepository, EnvironmentRepository],
  exports: [DeploymentService],
})
export class DeploymentModule {}
