import { Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceRepository } from "../../core/database/repositories";

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  create(data: { organizationId: string; name: string; repositoryId?: string; defaultBranch?: string; codingStandards?: string; aiConfiguration?: Record<string, unknown>; deploymentTarget?: string }) {
    return this.workspaceRepository.create({ ...data });
  }

  findByOrg(organizationId: string) {
    return this.workspaceRepository.findByOrg(organizationId);
  }

  async findById(id: string) {
    const ws = await this.workspaceRepository.findById(id);
    if (!ws) throw new NotFoundException("Workspace not found");
    return ws;
  }

  async update(id: string, data: Record<string, unknown>) {
    const ws = await this.workspaceRepository.update(id, data);
    if (!ws) throw new NotFoundException("Workspace not found");
    return ws;
  }

  remove(id: string) {
    return this.workspaceRepository.softDelete(id);
  }
}
