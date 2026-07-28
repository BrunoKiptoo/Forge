import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GitCredentialDocument } from "../schemas/git-credential.schema";
import { GitCredential } from "../schemas/git-credential.schema";

@Injectable()
export class GitCredentialRepository {
  constructor(@InjectModel(GitCredential.name) private model: Model<GitCredentialDocument>) {}

  async save(userId: string, token: string, provider = "github", username = ""): Promise<GitCredentialDocument> {
    const existing = await this.model.findOne({ userId }).exec();
    if (existing) {
      return this.model.findOneAndUpdate({ userId }, { token, provider, username }, { returnDocument: 'after' }).exec() as Promise<GitCredentialDocument>;
    }
    return this.model.create({ userId, token, provider, username });
  }

  async findByUser(userId: string): Promise<GitCredentialDocument | null> {
    return this.model.findOne({ userId }).select("+token").exec();
  }

  async getToken(userId: string): Promise<string | null> {
    const cred = await this.findByUser(userId);
    return cred?.token ?? null;
  }
}
