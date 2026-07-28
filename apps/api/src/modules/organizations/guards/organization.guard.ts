import type {
  CanActivate,
  ExecutionContext} from "@nestjs/common";
import {
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MembershipDocument } from "../../../core/database/schemas";
import { Membership } from "../../../core/database/schemas";

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const organizationId = request.params?.id;

    if (!userId || !organizationId) {
      throw new ForbiddenException("Access denied");
    }

    const membership = await this.membershipModel
      .findOne({ userId, organizationId, deletedAt: null })
      .exec();

    if (!membership) {
      throw new ForbiddenException("You are not a member of this organization");
    }

    request.membership = membership;
    return true;
  }
}

@Injectable()
export class OrganizationOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const organizationId = request.params?.id;

    if (!userId || !organizationId) {
      throw new ForbiddenException("Access denied");
    }

    const membership = await this.membershipModel
      .findOne({ userId, organizationId, role: "owner", deletedAt: null })
      .exec();

    if (!membership) {
      throw new ForbiddenException("Only organization owners can perform this action");
    }

    return true;
  }
}

@Injectable()
export class OrganizationAdminGuard implements CanActivate {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<MembershipDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const organizationId = request.params?.id;

    if (!userId || !organizationId) {
      throw new ForbiddenException("Access denied");
    }

    const membership = await this.membershipModel
      .findOne({
        userId,
        organizationId,
        role: { $in: ["owner", "admin"] },
        deletedAt: null,
      })
      .exec();

    if (!membership) {
      throw new ForbiddenException("Only owners and admins can perform this action");
    }

    return true;
  }
}
