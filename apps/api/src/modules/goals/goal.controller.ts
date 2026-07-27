import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { GoalService } from "./goal.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { IsString, IsOptional, IsArray, IsIn } from "class-validator";
import { GOAL_PRIORITY } from "../../core/database/schemas";
import type { GoalPriority } from "../../core/database/schemas";

class CreateGoalDto {
  @IsString() workspaceId: string;
  @IsString() organizationId: string;
  @IsString() projectId: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() objective?: string;
  @IsOptional() @IsArray() successCriteria?: string[];
  @IsOptional() @IsIn(GOAL_PRIORITY) priority?: GoalPriority;
  @IsOptional() @IsString() deadline?: string;
}

@Controller("goals")
@UseGuards(JwtAuthGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async create(@Body() dto: CreateGoalDto, @CurrentUser() user: { id: string }) {
    const goal = await this.goalService.create({ ...dto, createdBy: user.id });
    return { data: goal, message: "Goal created — decomposing into tasks", timestamp: new Date().toISOString() };
  }

  @Get()
  async findAll(@Query("workspaceId") workspaceId: string) {
    const goals = await this.goalService.findByWorkspace(workspaceId);
    return { data: goals, message: "Goals retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const goal = await this.goalService.findById(id);
    return { data: goal, message: "Goal retrieved", timestamp: new Date().toISOString() };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    const goal = await this.goalService.update(id, dto);
    return { data: goal, message: "Goal updated", timestamp: new Date().toISOString() };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.goalService.remove(id);
  }
}
