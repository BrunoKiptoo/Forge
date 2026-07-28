import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { ProjectRepository } from "../../core/database/repositories";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  }

  async create(dto: CreateProjectDto & { createdBy: string }) {
    const slug = this.createSlug(dto.name);
    const existing = await this.projectRepository.findBySlug(dto.organizationId, slug);
    if (existing) {
      throw new ConflictException("A project with this name already exists in the organization");
    }

    return this.projectRepository.create({
      organizationId: dto.organizationId,
      name: dto.name,
      slug,
      description: dto.description ?? "",
      icon: dto.icon ?? "folder",
      color: dto.color ?? "#6366f1",
      visibility: dto.visibility ?? "private",
      status: dto.status ?? "active",
      archived: false,
      createdBy: dto.createdBy,
    });
  }

  async findByOrganization(organizationId: string, options?: { status?: string; archived?: boolean }) {
    return this.projectRepository.findByOrganization(organizationId, options);
  }

  async findById(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (dto.name && dto.name !== project.name) {
      const slug = this.createSlug(dto.name);
      const existing = await this.projectRepository.findBySlug(
        String(project.organizationId),
        slug,
      );
      if (existing && String(existing._id) !== id) {
        throw new ConflictException("A project with this name already exists");
      }
      (dto as Record<string, unknown>).slug = slug;
    }

    return this.projectRepository.update(id, dto as Record<string, unknown>);
  }

  async remove(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return this.projectRepository.hardDelete(id);
  }

  async archive(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return this.projectRepository.update(id, {
      archived: true,
      status: "archived",
    } as Record<string, unknown>);
  }

  async restore(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return this.projectRepository.update(id, {
      archived: false,
      status: "active",
    } as Record<string, unknown>);
  }

  async toggleFavorite(id: string, userId: string) {
    const project = await this.projectRepository.toggleFavorite(id, userId);
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    return project;
  }

  async findFavorites(organizationId: string, userId: string) {
    return this.projectRepository.findByUserFavorites(organizationId, userId);
  }

  async search(organizationId: string, query: string) {
    if (!query || query.length < 2) {
      return this.projectRepository.findByOrganization(organizationId);
    }
    return this.projectRepository.searchByOrg(organizationId, query);
  }
}
