import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { OrganizationDocument } from "../schemas";
import { Organization } from "../schemas";

@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(@InjectModel(Organization.name) model: Model<OrganizationDocument>) {
    super(model);
  }

  async findBySlug(slug: string): Promise<OrganizationDocument | null> {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  async findByOwnerId(ownerId: string): Promise<OrganizationDocument[]> {
    return this.findAll({ ownerId });
  }
}
