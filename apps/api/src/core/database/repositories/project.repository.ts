import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { ProjectDocument } from "../schemas";
import { Project } from "../schemas";

@Injectable()
export class ProjectRepository extends BaseRepository<ProjectDocument> {
  constructor(@InjectModel(Project.name) model: Model<ProjectDocument>) {
    super(model);
  }

  async findByOrganization(
    organizationId: string,
    options?: { status?: string; archived?: boolean },
  ): Promise<ProjectDocument[]> {
    const filter: Record<string, unknown> = { organizationId };
    if (options?.status) filter.status = options.status;
    if (options?.archived !== undefined) filter.archived = options.archived;
    return this.findAll(filter);
  }

  async findBySlug(
    organizationId: string,
    slug: string,
  ): Promise<ProjectDocument | null> {
    return this.findOne({ organizationId, slug });
  }

  async findByUserFavorites(
    organizationId: string,
    userId: string,
  ): Promise<ProjectDocument[]> {
    return this.findAll({ organizationId, favoritedBy: userId });
  }

  async searchByOrg(organizationId: string, query: string): Promise<ProjectDocument[]> {
    return this.model
      .find({ organizationId, deletedAt: null, $text: { $search: query } })
      .exec();
  }

  async toggleFavorite(
    projectId: string,
    userId: string,
  ): Promise<ProjectDocument | null> {
    const project = await this.findById(projectId);
    if (!project) return null;

    const isFavorited = project.favoritedBy.some(
      (id) => String(id) === userId,
    );

    if (isFavorited) {
      return this.model
        .findOneAndUpdate(
          { _id: projectId, deletedAt: null },
          { $pull: { favoritedBy: userId } },
          { returnDocument: 'after' },
        )
        .exec();
    } else {
      return this.model
        .findOneAndUpdate(
          { _id: projectId, deletedAt: null },
          { $addToSet: { favoritedBy: userId } },
          { returnDocument: 'after' },
        )
        .exec();
    }
  }
}
