import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { MembershipsService } from "./memberships.service";
import { CreateMembershipDto } from "./dto/create-membership.dto";
import { UpdateMembershipDto } from "./dto/update-membership.dto";

@Controller("memberships")
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Post()
  async create(@Body() dto: CreateMembershipDto) {
    const membership = await this.membershipsService.create(dto);
    return { data: membership, message: "Membership created", timestamp: new Date().toISOString() };
  }

  @Get()
  async findAll() {
    const memberships = await this.membershipsService.findAll();
    return { data: memberships, message: "Memberships retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const membership = await this.membershipsService.findById(id);
    return { data: membership, message: "Membership retrieved", timestamp: new Date().toISOString() };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateMembershipDto) {
    const membership = await this.membershipsService.update(id, dto);
    return { data: membership, message: "Membership updated", timestamp: new Date().toISOString() };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.membershipsService.remove(id);
  }
}
