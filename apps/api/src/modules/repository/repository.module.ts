import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../core/database/database.module";
import { EmbeddingsModule } from "../../core/embeddings/embeddings.module";
import { RepositoryController } from "./repository.controller";
import { IndexerService } from "./indexer.service";
import { EmbeddingsService } from "./embeddings.service";
import { SearchService } from "./search.service";
import { ContextService } from "./context.service";
import { CodeChunkRepository } from "../../core/database/repositories";
import { GitCredentialRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, EmbeddingsModule],
  controllers: [RepositoryController],
  providers: [
    IndexerService, EmbeddingsService, SearchService, ContextService,
    CodeChunkRepository, GitCredentialRepository,
  ],
  exports: [IndexerService, SearchService, ContextService],
})
export class RepositoryModule {}
