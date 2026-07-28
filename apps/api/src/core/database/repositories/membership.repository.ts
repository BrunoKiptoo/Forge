import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { MembershipDocument } from "../schemas";
import { Membership } from "../schemas";

@Injectable()
export class MembershipRepository extends BaseRepository<MembershipDocument> {
  constructor(@InjectModel(Membership.name) model: Model<MembershipDocument>) {
    super(model);
  }

  async findByUser(userId: string): Promise<MembershipDocument[]> {
    return this.findAll({ userId });
  }

  async findByOrganization(organizationId: string): Promise<MembershipDocument[]> {
    return this.findAll({ organizationId });
  }

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<MembershipDocument | null> {
    return this.findOne({ userId, organizationId });
  }

  async findUserOrganizations(userId: string): Promise<MembershipDocument[]> {
    return this.model
      .find({ userId, deletedAt: null })
      .populate("organizationId")
      .exec();
  }

  async findOrganizationMembers(organizationId: string): Promise<MembershipDocument[]> {
    return this.model
      .find({ organizationId, deletedAt: null })
      .populate("userId")
      .exec();
  }
}
