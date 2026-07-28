import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AgentRepository } from "../../core/database/repositories";
import { AgentExecutionRepository } from "../../core/database/repositories";
import { ExecutionPlanRepository } from "../../core/database/repositories";
import { OrchestratorService } from "../orchestrator/orchestrator.service";
import { TaskRepository } from "../../core/database/repositories";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IsString, IsIn, IsOptional } from "class-validator";
import { AGENT_TYPES } from "../../core/database/schemas";
import type { AgentType } from "../../core/database/schemas";

class CreateAgentDto {
  @IsString() name: string;
  @IsIn(AGENT_TYPES) type: AgentType;
  @IsOptional() @IsString() provider?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() organizationId: string;
}

@Controller("agents")
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly executionRepository: AgentExecutionRepository,
    private readonly planRepository: ExecutionPlanRepository,
    private readonly orchestratorService: OrchestratorService,
    private readonly taskRepository: TaskRepository,
  ) {}

  @Get()
  async findAll(@Query("organizationId") organizationId: string) {
    const agents = organizationId
      ? await this.agentRepository.findByOrg(organizationId)
      : [];
    return { data: agents, message: "Agents retrieved", timestamp: new Date().toISOString() };
  }

  @Post()
  async create(@Body() dto: CreateAgentDto) {
    const agent = await this.agentRepository.create({ ...dto });
    return { data: agent, message: "Agent created", timestamp: new Date().toISOString() };
  }

  @Get("executions")
  async getExecutions(@Query("organizationId") organizationId: string) {
    const executions = await this.executionRepository.findByOrg(organizationId);
    return { data: executions, message: "Executions retrieved", timestamp: new Date().toISOString() };
  }

  @Post("preview")
  async preview(
    @Body("taskId") taskId: string,
  ) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return { data: null, message: "Task not found", timestamp: new Date().toISOString() };
    }
    const { plan, costMeta } = await this.orchestratorService.preview(
      taskId, task.title, task.description,
    );
    return { data: { plan, costMeta }, message: "Plan preview generated", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const agent = await this.agentRepository.findById(id);
    return { data: agent, message: "Agent retrieved", timestamp: new Date().toISOString() };
  }
  @Post(":id/orchestrate")
  async orchestrate(
    @Param("id") _id: string,
    @Body("taskId") taskId: string,
    @Body("repoFullName") repoFullName?: string,
  ) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return { data: null, message: "Task not found", timestamp: new Date().toISOString() };
    }

    const plan = await this.orchestratorService.orchestrate(
      taskId,
      task.title,
      task.description,
      String(task.organizationId),
      repoFullName,
    );

    return { data: plan, message: "Orchestration started", timestamp: new Date().toISOString() };
  }

  @Get(":id/plans")
  async getPlans(@Param("id") id: string) {
    // id here is taskId
    const plan = await this.planRepository.findByTaskId(id);
    return {
      data: plan,
      message: plan ? "Plan retrieved" : "No plan found",
      timestamp: new Date().toISOString(),
    };
  }
}
