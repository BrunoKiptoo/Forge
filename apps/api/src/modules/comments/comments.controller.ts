import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CommentsService } from "./comments.service";

@UseGuards(JwtAuthGuard)
@Controller("comments")
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Post()
  async create(
    @Body() body: { organizationId: string; entityType: string; entityId: string; body: string; mentions?: string[] },
    @CurrentUser() user: { id: string },
  ) {
    const data = await this.service.create({ ...body, authorId: user.id });
    return { data };
  }

  @Get()
  async findByEntity(
    @Query("entityType") entityType: string,
    @Query("entityId") entityId: string,
  ) {
    const data = await this.service.findByEntity(entityType, entityId);
    return { data };
  }

  @Patch(":id/resolve")
  async resolve(@Param("id") id: string) {
    const data = await this.service.resolve(id);
    return { data };
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.service.delete(id);
    return { data: null };
  }
}
