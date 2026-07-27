import { Injectable } from "@nestjs/common";
import { CodeChunkRepository } from "../../core/database/repositories";
import { GitCredentialRepository } from "../../core/database/repositories";

const CODE_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx", "json", "md", "yaml", "yml", "py", "rs", "go", "css", "html"]);

interface ParsedFile {
  path: string;
  language: string;
  content: string;
}

@Injectable()
export class IndexerService {
  constructor(
    private readonly chunkRepository: CodeChunkRepository,
    private readonly credentialRepository: GitCredentialRepository,
  ) {}

  async indexRepository(userId: string, organizationId: string, owner: string, repo: string) {
    const token = await this.credentialRepository.getToken(userId);
    if (!token) throw new Error("GitHub not connected");

    const files = await this.fetchRepoFiles(token, owner, repo);
    const repoFullName = `${owner}/${repo}`;

    const chunks = files.flatMap((file) => this.chunkFile(file));
    await this.chunkRepository.saveChunks(organizationId, repoFullName, chunks);

    return { filesIndexed: files.length, chunksCreated: chunks.length, repoFullName };
  }

  private chunkFile(file: ParsedFile) {
    const chunks: {
      filePath: string; language: string; content: string;
      symbolName?: string; symbolType?: string; startLine?: number; endLine?: number;
    }[] = [];

    // Always store the full file as one chunk
    chunks.push({ filePath: file.path, language: file.language, content: file.content });

    // Extract top-level symbols from TypeScript/JavaScript
    if (["ts", "tsx", "js", "jsx"].includes(file.language)) {
      const lines = file.content.split("\n");
      const symbolRegex = /^(?:export\s+)?(?:(class|interface|function|const|type|enum)\s+(\w+))/;

      let currentSymbol: { name: string; type: string; start: number } | null = null;

      for (let i = 0; i < lines.length; i++) {
        const match = symbolRegex.exec(lines[i]!);
        if (match) {
          if (currentSymbol && i - currentSymbol.start > 2) {
            const symbolContent = lines.slice(currentSymbol.start, i).join("\n");
            chunks.push({
              filePath: file.path, language: file.language,
              content: symbolContent, symbolName: currentSymbol.name,
              symbolType: currentSymbol.type, startLine: currentSymbol.start + 1, endLine: i,
            });
          }
          currentSymbol = { name: match[2]!, type: match[1]!, start: i };
        }
      }

      if (currentSymbol) {
        const symbolContent = lines.slice(currentSymbol.start).join("\n");
        chunks.push({
          filePath: file.path, language: file.language,
          content: symbolContent, symbolName: currentSymbol.name,
          symbolType: currentSymbol.type, startLine: currentSymbol.start + 1, endLine: lines.length,
        });
      }
    }

    return chunks;
  }

  private async fetchRepoFiles(token: string, owner: string, repo: string, path = ""): Promise<ParsedFile[]> {
    const octokit = await this.getOctokit(token);
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });

    const results: ParsedFile[] = [];
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (item.type === "dir") {
        if (!item.name.startsWith(".") && item.name !== "node_modules" && item.name !== "dist") {
          results.push(...await this.fetchRepoFiles(token, owner, repo, item.path));
        }
      } else if (item.type === "file" && item.size < 100_000) {
        const ext = item.name.split(".").pop() ?? "";
        const isCode = CODE_EXTENSIONS.has(ext) || item.name === "Dockerfile" || item.name.endsWith(".config.ts");
        if (isCode && item.content) {
          results.push({
            path: item.path,
            language: ext || "text",
            content: Buffer.from(item.content, "base64").toString("utf-8"),
          });
        }
      }
    }

    return results;
  }

  private async getOctokit(token: string) {
    const { Octokit } = await import("octokit");
    return new Octokit({ auth: token });
  }
}
