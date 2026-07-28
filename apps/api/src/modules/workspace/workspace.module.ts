import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { WorkspaceController } from "./workspace.controller";
import { WorkspaceService } from "./workspace.service";
import { MemoryService } from "./memory.service";
import { WorkspaceRepository } from "../../core/database/repositories";
import { WorkspaceMemoryRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, MemoryService, WorkspaceRepository, WorkspaceMemoryRepository],
  exports: [WorkspaceService, MemoryService],
})
export class WorkspaceModule {}
