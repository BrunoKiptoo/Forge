import { Injectable } from "@nestjs/common";
import { SearchService } from "./search.service";

@Injectable()
export class ContextService {
  constructor(private readonly searchService: SearchService) {}

  async buildContext(organizationId: string, repoFullName: string, taskDescription: string, maxFiles = 3) {
    const results = await this.searchService.search(organizationId, repoFullName, taskDescription, maxFiles);

    let context = "Repository context:\n\n";
    for (const r of results) {
      context += `File: ${r.filePath}\n`;
      if (r.symbolName) context += `Symbol: ${r.symbolName}\n`;
      context += `\`\`\`${r.language}\n${r.content.slice(0, 500)}\n\`\`\`\n\n`;
    }

    return {
      files: results.map((r) => r.filePath),
      context,
      relevance: results.map((r) => ({ file: r.filePath, score: Math.round(r.score * 100) / 100 })),
    };
  }
}
