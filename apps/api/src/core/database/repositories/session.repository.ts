import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { SessionDocument } from "../schemas";
import { Session } from "../schemas";

@Injectable()
export class SessionRepository extends BaseRepository<SessionDocument> {
  constructor(@InjectModel(Session.name) model: Model<SessionDocument>) {
    super(model);
  }

  async findByUser(userId: string): Promise<SessionDocument[]> {
    return this.findAll({ userId });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.model.deleteMany({ userId }).exec();
  }

  async findByTokenHash(hash: string): Promise<SessionDocument | null> {
    return this.model
      .findOne({ refreshTokenHash: hash, deletedAt: null })
      .select("+refreshTokenHash")
      .exec();
  }

  async findByIdWithToken(id: string): Promise<SessionDocument | null> {
    return this.model
      .findOne({ _id: id, deletedAt: null })
      .select("+refreshTokenHash")
      .exec();
  }

  async deleteExpired(): Promise<number> {
    const result = await this.model.deleteMany({
      expiresAt: { $lt: new Date() },
    }).exec();
    return result.deletedCount;
  }
}
