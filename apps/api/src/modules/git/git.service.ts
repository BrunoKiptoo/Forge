import { Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { GitHubProvider } from "../../core/git/providers/github.provider";
import { GitCredentialRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";
import { GitRepository, GitBranch, GitCommit, GitPullRequest } from "../../core/git/interfaces/provider.interface";

@Injectable()
export class GitService {
  constructor(
    private readonly githubProvider: GitHubProvider,
    private readonly credentialRepository: GitCredentialRepository,
    private readonly artifactRepository: ArtifactRepository,
  ) {}

  async connect(userId: string, token: string, username = "") {
    await this.credentialRepository.save(userId, token, "github", username);
    return { message: "GitHub connected successfully" };
  }

  async getToken(userId: string): Promise<string> {
    const token = await this.credentialRepository.getToken(userId);
    if (!token) throw new UnauthorizedException("GitHub not connected. Connect first at POST /git/connect");
    return token;
  }

  async listRepositories(userId: string): Promise<GitRepository[]> {
    const token = await this.getToken(userId);
    return this.githubProvider.listRepositories(token);
  }

  async listBranches(userId: string, owner: string, repo: string): Promise<GitBranch[]> {
    const token = await this.getToken(userId);
    return this.githubProvider.listBranches(token, owner, repo);
  }

  async listCommits(userId: string, owner: string, repo: string, branch?: string): Promise<GitCommit[]> {
    const token = await this.getToken(userId);
    return this.githubProvider.listCommits(token, owner, repo, branch);
  }

  async getRepository(userId: string, owner: string, repo: string): Promise<GitRepository | null> {
    const token = await this.getToken(userId);
    return this.githubProvider.getRepository(token, owner, repo);
  }

  async createBranch(userId: string, owner: string, repo: string, branchName: string): Promise<GitBranch> {
    const token = await this.getToken(userId);
    const branches = await this.githubProvider.listBranches(token, owner, repo);
    const main = branches.find((b) => b.name === "main" || b.name === "master");
    if (!main) throw new NotFoundException("Default branch not found");
    return this.githubProvider.createBranch(token, owner, repo, branchName, main.sha);
  }

  async pushArtifacts(
    userId: string, owner: string, repo: string, branch: string,
    taskId: string, message: string,
  ): Promise<{ filesPushed: number }> {
    const token = await this.getToken(userId);
    const artifacts = await this.artifactRepository.findByTask(taskId);

    let count = 0;
    for (const art of artifacts) {
      await this.githubProvider.createOrUpdateFile(
        token, owner, repo, art.filename, art.content, message, branch,
      );
      count++;
    }

    return { filesPushed: count };
  }

  async createPullRequest(
    userId: string, owner: string, repo: string,
    title: string, body: string, head: string, base = "main",
  ): Promise<GitPullRequest> {
    const token = await this.getToken(userId);
    return this.githubProvider.createPullRequest(token, owner, repo, title, body, head, base);
  }
}
