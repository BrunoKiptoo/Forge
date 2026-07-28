import { Injectable, NotFoundException } from "@nestjs/common";
import { CommentRepository } from "../../core/database/repositories";
import { ForgeGateway } from "../../core/gateway/forge.gateway";

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly gateway: ForgeGateway,
  ) {}

  async create(data: {
    organizationId: string;
    entityType: string;
    entityId: string;
    authorId: string;
    body: string;
    mentions?: string[];
  }) {
    const comment = await this.commentRepository.create({
      organizationId: data.organizationId as never,
      entityType: data.entityType,
      entityId: data.entityId as never,
      authorId: data.authorId as never,
      body: data.body,
      mentions: (data.mentions ?? []) as never,
    });

    this.gateway.emit(`entity:${data.entityId}`, "comment.created", comment);
    this.gateway.emit(`org:${data.organizationId}`, "comment.created", { entityId: data.entityId, entityType: data.entityType });

    return comment;
  }

  findByEntity(entityType: string, entityId: string) {
    return this.commentRepository.findByEntity(entityType, entityId);
  }

  countByEntity(entityType: string, entityId: string) {
    return this.commentRepository.countByEntity(entityType, entityId);
  }

  async resolve(id: string) {
    const comment = await this.commentRepository.update(id, { resolved: true });
    if (!comment) throw new NotFoundException("Comment not found");
    return comment;
  }

  async delete(id: string) {
    await this.commentRepository.delete(id);
  }
}
