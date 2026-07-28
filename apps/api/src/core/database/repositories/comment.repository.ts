import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "../schemas/comment.schema";

@Injectable()
export class CommentRepository {
  constructor(@InjectModel(Comment.name) private readonly model: Model<CommentDocument>) {}

  create(data: Partial<Comment>) {
    return this.model.create(data);
  }

  findByEntity(entityType: string, entityId: string) {
    return this.model
      .find({ entityType, entityId })
      .populate("authorId", "name avatar")
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  countByEntity(entityType: string, entityId: string) {
    return this.model.countDocuments({ entityType, entityId }).exec();
  }

  update(id: string, data: Partial<Comment>) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' }).lean().exec();
  }

  delete(id: string) {
    return this.model.findByIdAndDelete(id).exec();
  }
}
