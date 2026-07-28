import { Injectable } from "@nestjs/common";
import type {
  GitProvider,
  GitRepository,
  GitBranch,
  GitCommit,
  GitPullRequest,
} from "../interfaces/provider.interface";

@Injectable()
export class GitHubProvider implements GitProvider {
  readonly name = "github";

  private async getOctokit(token: string) {
    const { Octokit } = await import("octokit");
    return new Octokit({ auth: token });
  }

  async listRepositories(token: string): Promise<GitRepository[]> {
    const octokit = await this.getOctokit(token);
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated", per_page: 100,
    });
    return data.map((r) => ({
      id: r.id, name: r.name, fullName: r.full_name, private: r.private,
      url: r.html_url, cloneUrl: r.clone_url ?? "",
      defaultBranch: r.default_branch, description: r.description,
    }));
  }

  async listBranches(token: string, owner: string, repo: string): Promise<GitBranch[]> {
    const octokit = await this.getOctokit(token);
    const { data } = await octokit.rest.repos.listBranches({ owner, repo, per_page: 100 });
    return data.map((b) => ({ name: b.name, sha: b.commit.sha }));
  }

  async listCommits(token: string, owner: string, repo: string, branch?: string): Promise<GitCommit[]> {
    const octokit = await this.getOctokit(token);
    const { data } = await octokit.rest.repos.listCommits({
      owner, repo, sha: branch, per_page: 30,
    });
    return data.map((c) => ({
      sha: c.sha, message: c.commit.message,
      author: c.commit.author?.name ?? "unknown",
      date: c.commit.author?.date ?? "",
    }));
  }

  async getRepository(token: string, owner: string, repo: string): Promise<GitRepository | null> {
    try {
      const octokit = await this.getOctokit(token);
      const { data } = await octokit.rest.repos.get({ owner, repo });
      return {
        id: data.id, name: data.name, fullName: data.full_name, private: data.private,
        url: data.html_url, cloneUrl: data.clone_url ?? "",
        defaultBranch: data.default_branch, description: data.description,
      };
    } catch {
      return null;
    }
  }

  async createBranch(token: string, owner: string, repo: string, branchName: string, fromSha: string): Promise<GitBranch> {
    const octokit = await this.getOctokit(token);
    const { data } = await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: fromSha });
    return { name: branchName, sha: data.object.sha };
  }

  async createOrUpdateFile(
    token: string, owner: string, repo: string, path: string,
    content: string, message: string, branch: string,
  ): Promise<void> {
    const octokit = await this.getOctokit(token);
    const contentBase64 = Buffer.from(content).toString("base64");

    try {
      const { data: existing } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
      if (!Array.isArray(existing) && "sha" in existing) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner, repo, path, message, content: contentBase64,
          branch, sha: existing.sha,
        });
        return;
      }
    } catch {
      // File doesn't exist yet, create it
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner, repo, path, message, content: contentBase64, branch,
    });
  }

  async createPullRequest(
    token: string, owner: string, repo: string,
    title: string, body: string, head: string, base: string,
  ): Promise<GitPullRequest> {
    const octokit = await this.getOctokit(token);
    const { data } = await octokit.rest.pulls.create({ owner, repo, title, body, head, base });
    return { number: data.number, title: data.title, body: data.body ?? "", state: data.state, url: data.html_url };
  }
}
