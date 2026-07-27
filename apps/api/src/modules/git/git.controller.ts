import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from "@nestjs/common";
import { GitService } from "./git.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { IsString, IsOptional } from "class-validator";

class ConnectDto {
  @IsString() token: string;
  @IsOptional() @IsString() username?: string;
}

class PushArtifactsDto {
  @IsString() owner: string;
  @IsString() repo: string;
  @IsString() branch: string;
  @IsString() taskId: string;
  @IsOptional() @IsString() message?: string;
}

class CreatePRDto {
  @IsString() owner: string;
  @IsString() repo: string;
  @IsString() title: string;
  @IsString() body: string;
  @IsString() head: string;
  @IsOptional() @IsString() base?: string;
}

@Controller("git")
@UseGuards(JwtAuthGuard)
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Post("connect")
  async connect(@Body() dto: ConnectDto, @CurrentUser() user: { id: string }) {
    const result = await this.gitService.connect(user.id, dto.token, dto.username ?? "");
    return { data: result, message: "Connected", timestamp: new Date().toISOString() };
  }

  @Get("repos")
  async listRepos(@CurrentUser() user: { id: string }) {
    const repos = await this.gitService.listRepositories(user.id);
    return { data: repos, message: "Repositories retrieved", timestamp: new Date().toISOString() };
  }

  @Get("repos/:owner/:repo/branches")
  async listBranches(
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @CurrentUser() user: { id: string },
  ) {
    const branches = await this.gitService.listBranches(user.id, owner, repo);
    return { data: branches, message: "Branches retrieved", timestamp: new Date().toISOString() };
  }

  @Get("repos/:owner/:repo/commits")
  async listCommits(
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Query("branch") branch: string,
    @CurrentUser() user: { id: string },
  ) {
    const commits = await this.gitService.listCommits(user.id, owner, repo, branch);
    return { data: commits, message: "Commits retrieved", timestamp: new Date().toISOString() };
  }

  @Post("repos/:owner/:repo/branches")
  async createBranch(
    @Param("owner") owner: string,
    @Param("repo") repo: string,
    @Body("name") name: string,
    @CurrentUser() user: { id: string },
  ) {
    const branch = await this.gitService.createBranch(user.id, owner, repo, name);
    return { data: branch, message: "Branch created", timestamp: new Date().toISOString() };
  }

  @Post("artifacts/push")
  async pushArtifacts(@Body() dto: PushArtifactsDto, @CurrentUser() user: { id: string }) {
    const result = await this.gitService.pushArtifacts(
      user.id, dto.owner, dto.repo, dto.branch, dto.taskId,
      dto.message ?? "Forge: push generated artifacts",
    );
    return { data: result, message: "Artifacts pushed", timestamp: new Date().toISOString() };
  }

  @Post("pr")
  async createPullRequest(@Body() dto: CreatePRDto, @CurrentUser() user: { id: string }) {
    const pr = await this.gitService.createPullRequest(
      user.id, dto.owner, dto.repo, dto.title, dto.body, dto.head, dto.base ?? "main",
    );
    return { data: pr, message: "Pull request created", timestamp: new Date().toISOString() };
  }
}
