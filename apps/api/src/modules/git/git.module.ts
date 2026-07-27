import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { GitController } from "./git.controller";
import { GitService } from "./git.service";
import { GitHubProvider } from "../../core/git/providers/github.provider";
import { GitCredentialRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule],
  controllers: [GitController],
  providers: [GitService, GitHubProvider, GitCredentialRepository, ArtifactRepository],
  exports: [GitService],
})
export class GitModule {}
