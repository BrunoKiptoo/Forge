import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { UserDocument } from "../schemas";
import { User } from "../schemas";

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) model: Model<UserDocument>) {
    super(model);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase(), deletedAt: null }).exec();
  }

  async findByGithubId(githubId: string): Promise<UserDocument | null> {
    return this.model.findOne({ githubId, deletedAt: null }).exec();
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ _id: id, deletedAt: null })
      .select("+passwordHash")
      .exec();
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ email: email.toLowerCase(), deletedAt: null })
      .select("+passwordHash")
      .exec();
  }
}
