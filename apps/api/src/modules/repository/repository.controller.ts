import {
  Controller, Post, Get, Body, Query, UseGuards,
} from "@nestjs/common";
import { IndexerService } from "./indexer.service";
import { EmbeddingsService } from "./embeddings.service";
import { SearchService } from "./search.service";
import { ContextService } from "./context.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { IsString } from "class-validator";

class IndexRepoDto {
  @IsString() owner: string;
  @IsString() repo: string;
}

@Controller("repository")
@UseGuards(JwtAuthGuard)
export class RepositoryController {
  constructor(
    private readonly indexerService: IndexerService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly searchService: SearchService,
    private readonly contextService: ContextService,
  ) {}

  @Post("index")
  async index(
    @Body() dto: IndexRepoDto,
    @CurrentUser() user: { id: string },
    @Query("organizationId") organizationId: string,
  ) {
    const result = await this.indexerService.indexRepository(
      user.id, organizationId, dto.owner, dto.repo,
    );
    return { data: result, message: "Repository indexed", timestamp: new Date().toISOString() };
  }

  @Post("embeddings")
  async generateEmbeddings(
    @Body("repoFullName") repoFullName: string,
    @Query("organizationId") organizationId: string,
  ) {
    const result = await this.embeddingsService.generateEmbeddings(organizationId, repoFullName);
    return { data: result, message: "Embeddings generated", timestamp: new Date().toISOString() };
  }

  @Get("search")
  async search(
    @Query("organizationId") organizationId: string,
    @Query("repoFullName") repoFullName: string,
    @Query("q") query: string,
    @Query("topK") topK: string,
  ) {
    const k = topK ? parseInt(topK, 10) : 5;
    const results = await this.searchService.search(organizationId, repoFullName, query, k);
    return { data: results, message: "Search complete", timestamp: new Date().toISOString() };
  }

  @Get("context")
  async context(
    @Query("organizationId") organizationId: string,
    @Query("repoFullName") repoFullName: string,
    @Query("task") task: string,
  ) {
    const result = await this.contextService.buildContext(organizationId, repoFullName, task);
    return { data: result, message: "Context built", timestamp: new Date().toISOString() };
  }
}
