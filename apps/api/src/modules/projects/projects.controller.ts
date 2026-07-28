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
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("projects")
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: { id: string },
  ) {
    const project = await this.projectsService.create({
      ...dto,
      createdBy: user.id,
    });
    return {
      data: project,
      message: "Project created",
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async findAll(
    @Query("organizationId") organizationId?: string,
    @Query("search") search?: string,
    @Query("favorites") favorites?: string,
    @CurrentUser() user?: { id: string },
  ) {
    if (search && organizationId) {
      const results = await this.projectsService.search(organizationId, search);
      return { data: results, message: "Search results", timestamp: new Date().toISOString() };
    }

    if (favorites === "true" && organizationId && user) {
      const results = await this.projectsService.findFavorites(organizationId, user.id);
      return { data: results, message: "Favorite projects", timestamp: new Date().toISOString() };
    }

    if (organizationId) {
      const projects = await this.projectsService.findByOrganization(organizationId, {
        archived: false,
      });
      return { data: projects, message: "Projects retrieved", timestamp: new Date().toISOString() };
    }

    const all = await this.projectsService.findByOrganization("", { archived: false });
    return { data: all, message: "Projects retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const project = await this.projectsService.findById(id);
    return { data: project, message: "Project retrieved", timestamp: new Date().toISOString() };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.projectsService.update(id, dto);
    return { data: project, message: "Project updated", timestamp: new Date().toISOString() };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.projectsService.remove(id);
  }

  @Post(":id/archive")
  @HttpCode(HttpStatus.OK)
  async archive(@Param("id") id: string) {
    const project = await this.projectsService.archive(id);
    return { data: project, message: "Project archived", timestamp: new Date().toISOString() };
  }

  @Post(":id/restore")
  @HttpCode(HttpStatus.OK)
  async restore(@Param("id") id: string) {
    const project = await this.projectsService.restore(id);
    return { data: project, message: "Project restored", timestamp: new Date().toISOString() };
  }

  @Post(":id/favorite")
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(
    @Param("id") id: string,
    @CurrentUser() user: { id: string },
  ) {
    const project = await this.projectsService.toggleFavorite(id, user.id);
    return { data: project, message: "Favorite toggled", timestamp: new Date().toISOString() };
  }
}
