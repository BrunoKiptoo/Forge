import { Injectable } from "@nestjs/common";
import { EmbeddingProvider } from "../interfaces/provider.interface";

class TFIDFVectorizer {
  private idf = new Map<string, number>();
  private vocabulary: string[] = [];

  fit(documents: string[]) {
    const docCount = documents.length;
    const df = new Map<string, number>();

    for (const doc of documents) {
      const terms = new Set(this.tokenize(doc));
      for (const term of terms) {
        df.set(term, (df.get(term) ?? 0) + 1);
      }
    }

    for (const [term, count] of df) {
      this.idf.set(term, Math.log((docCount + 1) / (count + 1)) + 1);
    }

    this.vocabulary = [...this.idf.keys()].sort();
  }

  transform(text: string): number[] {
    const tokens = this.tokenize(text);
    const tf = new Map<string, number>();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }

    const vec = new Array(this.vocabulary.length).fill(0);
    for (let i = 0; i < this.vocabulary.length; i++) {
      const term = this.vocabulary[i]!;
      const tfVal = tf.get(term) ?? 0;
      const idfVal = this.idf.get(term) ?? 0;
      vec[i] = tfVal * idfVal;
    }

    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) vec[i]! /= norm;
    }

    return vec;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_$]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !/^\d+$/.test(t));
  }
}

@Injectable()
export class StubEmbeddingProvider implements EmbeddingProvider {
  readonly name = "stub-tfidf";
  readonly dimensions = 256;
  private vectorizer: TFIDFVectorizer | null = null;

  async generateEmbedding(text: string): Promise<number[]> {
    const vec = this.getVectorizer().transform(text);
    return this.padOrTruncate(vec);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    this.vectorizer = null;
    const v = this.getVectorizer();
    return texts.map((t) => this.padOrTruncate(v.transform(t)));
  }

  similarity(a: number[], b: number[]): number {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i]! * b[i]!;
      na += a[i]! * a[i]!;
      nb += b[i]! * b[i]!;
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom > 0 ? dot / denom : 0;
  }

  private getVectorizer(): TFIDFVectorizer {
    if (!this.vectorizer) {
      this.vectorizer = new TFIDFVectorizer();
      this.vectorizer.fit(this.defaultDocuments);
    }
    return this.vectorizer;
  }

  private padOrTruncate(vec: number[]): number[] {
    if (vec.length >= this.dimensions) return vec.slice(0, this.dimensions);
    return [...vec, ...new Array(this.dimensions - vec.length).fill(0)];
  }

  private defaultDocuments = [
    "export class UserService",
    "import Injectable from nestjs common",
    "async function createUser data createUserDto",
    "constructor private readonly userRepository",
    "return this userRepository create data",
    "export interface AIProvider",
    "generate request AICompletionRequest Promise",
    "const response await this client chat completions create",
    "messages role system user assistant content",
    "export class OrchestratorService execute steps",
    "agentRepository findAvailable organizationId step agentType",
    "planRepository update step order failed error",
    "activityRepository create organizationId action entityType entityId",
    "export function parseArtifacts response agentType",
    "const codeBlockRegex match language filename content",
    "artifacts push length response trim length",
    "export class GitService connect user token",
    "githubProvider listRepositories token",
    "octokit rest repos createOrUpdateFileContents",
    "export class PromptBuilder build agentType input context",
  ];
}
