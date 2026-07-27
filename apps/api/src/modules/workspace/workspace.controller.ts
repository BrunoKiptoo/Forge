import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { MemoryService } from "./memory.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IsString, IsOptional } from "class-validator";
import type { MemoryCategory } from "../../core/database/schemas";

class CreateWorkspaceDto {
  @IsString() organizationId: string;
  @IsString() name: string;
  @IsOptional() @IsString() repositoryId?: string;
  @IsOptional() @IsString() defaultBranch?: string;
  @IsOptional() @IsString() codingStandards?: string;
  @IsOptional() @IsString() deploymentTarget?: string;
}

class UpsertMemoryDto {
  @IsString() organizationId: string;
  @IsString() category: MemoryCategory;
  @IsString() key: string;
  @IsString() value: string;
}

@Controller("workspaces")
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly memoryService: MemoryService,
  ) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto) {
    const ws = await this.workspaceService.create(dto);
    return { data: ws, message: "Workspace created", timestamp: new Date().toISOString() };
  }

  @Get()
  async findAll(@Query("organizationId") organizationId: string) {
    const workspaces = await this.workspaceService.findByOrg(organizationId);
    return { data: workspaces, message: "Workspaces retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const ws = await this.workspaceService.findById(id);
    return { data: ws, message: "Workspace retrieved", timestamp: new Date().toISOString() };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    const ws = await this.workspaceService.update(id, dto);
    return { data: ws, message: "Workspace updated", timestamp: new Date().toISOString() };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.workspaceService.remove(id);
  }

  // Memory endpoints
  @Get(":id/memory")
  async getMemory(@Param("id") id: string, @Query("category") category?: MemoryCategory) {
    const entries = await this.memoryService.findByWorkspace(id, category);
    return { data: entries, message: "Memory retrieved", timestamp: new Date().toISOString() };
  }

  @Post(":id/memory")
  async upsertMemory(@Param("id") id: string, @Body() dto: UpsertMemoryDto) {
    const entry = await this.memoryService.upsert(id, dto.organizationId, dto.category, dto.key, dto.value);
    return { data: entry, message: "Memory saved", timestamp: new Date().toISOString() };
  }

  @Delete(":id/memory/:memoryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemory(@Param("memoryId") memoryId: string) {
    await this.memoryService.delete(memoryId);
  }
}
