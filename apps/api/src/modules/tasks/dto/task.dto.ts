import { IsString, IsIn, IsOptional, MinLength, MaxLength } from "class-validator";
import { TASK_PRIORITY, TASK_STATUS } from "../../../core/database/schemas";
import type { TaskPriority, TaskStatus } from "../../../core/database/schemas";

export class CreateTaskDto {
  @IsString()
  projectId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITY)
  priority?: TaskPriority;

  @IsOptional()
  @IsIn(TASK_STATUS)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assignedAgent?: string;

  @IsOptional()
  organizationId?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITY)
  priority?: string;

  @IsOptional()
  @IsIn(TASK_STATUS)
  status?: string;

  @IsOptional()
  @IsString()
  assignedAgent?: string;
}
