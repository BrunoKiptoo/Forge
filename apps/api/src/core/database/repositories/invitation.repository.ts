import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { InvitationDocument } from "../schemas/invitation.schema";
import { Invitation } from "../schemas/invitation.schema";

@Injectable()
export class InvitationRepository extends BaseRepository<InvitationDocument> {
  constructor(@InjectModel(Invitation.name) model: Model<InvitationDocument>) {
    super(model);
  }

  async findByToken(token: string): Promise<InvitationDocument | null> {
    return this.model.findOne({ token, deletedAt: null }).exec();
  }

  async findPendingByOrgAndEmail(
    organizationId: string,
    email: string,
  ): Promise<InvitationDocument[]> {
    return this.model
      .find({ organizationId, email: email.toLowerCase(), status: "pending", deletedAt: null })
      .exec();
  }

  async findPendingByOrg(organizationId: string): Promise<InvitationDocument[]> {
    return this.model
      .find({ organizationId, status: "pending", deletedAt: null })
      .populate("invitedBy", "name email avatar")
      .exec();
  }

  async expireInvitations(): Promise<number> {
    const result = await this.model
      .updateMany(
        { status: "pending", expiresAt: { $lt: new Date() }, deletedAt: null },
        { status: "rejected" },
      )
      .exec();
    return result.modifiedCount;
  }
}
