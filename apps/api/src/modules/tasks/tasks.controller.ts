import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ArtifactRepository } from "../../core/database/repositories";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly artifactRepository: ArtifactRepository,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: { id: string },
  ) {
    const task = await this.tasksService.create({
      ...dto,
      createdBy: user.id,
      organizationId: dto.organizationId ?? "",
    });
    return { data: task, message: "Task created", timestamp: new Date().toISOString() };
  }

  @Get()
  async findAll(
    @Query("organizationId") organizationId?: string,
    @Query("projectId") projectId?: string,
    @Query("status") status?: string,
  ) {
    if (projectId) {
      const tasks = await this.tasksService.findByProject(projectId, status);
      return { data: tasks, message: "Tasks retrieved", timestamp: new Date().toISOString() };
    }
    if (organizationId) {
      const tasks = await this.tasksService.findByOrganization(organizationId, { status, projectId: undefined });
      return { data: tasks, message: "Tasks retrieved", timestamp: new Date().toISOString() };
    }
    return { data: [], message: "No filter provided", timestamp: new Date().toISOString() };
  }

  @Get("stats")
  async getStats(@Query("organizationId") organizationId: string) {
    const stats = await this.tasksService.getStats(organizationId);
    return { data: stats, message: "Stats retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const task = await this.tasksService.findById(id);
    return { data: task, message: "Task retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id/executions")
  async getExecutions(@Param("id") id: string) {
    const executions = await this.tasksService.getExecutions(id);
    return { data: executions, message: "Executions retrieved", timestamp: new Date().toISOString() };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: { id: string },
  ) {
    const task = await this.tasksService.update(id, dto, user.id);
    return { data: task, message: "Task updated", timestamp: new Date().toISOString() };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.tasksService.remove(id, user.id);
  }

  @Post(":id/assign")
  async assign(
    @Param("id") id: string,
    @Body("agentId") agentId: string,
    @CurrentUser() user: { id: string },
  ) {
    const task = await this.tasksService.assign(id, agentId, user.id);
    return { data: task, message: "Task assigned", timestamp: new Date().toISOString() };
  }

  @Post(":id/execute")
  async execute(
    @Param("id") id: string,
    @CurrentUser() user: { id: string },
  ) {
    const execution = await this.tasksService.execute(id, user.id);
    return { data: execution, message: "Execution started", timestamp: new Date().toISOString() };
  }

  @Get(":id/artifacts")
  async getArtifacts(@Param("id") id: string) {
    const artifacts = await this.artifactRepository.findByTask(id);
    return { data: artifacts, message: "Artifacts retrieved", timestamp: new Date().toISOString() };
  }
}
