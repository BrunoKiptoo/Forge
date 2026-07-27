export interface GitRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  description: string | null;
}

export interface GitBranch {
  name: string;
  sha: string;
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface GitPullRequest {
  number: number;
  title: string;
  body: string;
  state: string;
  url: string;
}

export interface GitProvider {
  readonly name: string;
  listRepositories(token: string): Promise<GitRepository[]>;
  listBranches(token: string, owner: string, repo: string): Promise<GitBranch[]>;
  listCommits(token: string, owner: string, repo: string, branch?: string): Promise<GitCommit[]>;
  getRepository(token: string, owner: string, repo: string): Promise<GitRepository | null>;
  createBranch(token: string, owner: string, repo: string, branchName: string, fromSha: string): Promise<GitBranch>;
  createOrUpdateFile(token: string, owner: string, repo: string, path: string, content: string, message: string, branch: string): Promise<void>;
  createPullRequest(token: string, owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<GitPullRequest>;
}
