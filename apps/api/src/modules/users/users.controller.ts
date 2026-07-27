import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      data: user,
      message: "User created",
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      data: users,
      message: "Users retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: { id: string }) {
    const profile = await this.usersService.findById(user.id);
    return {
      data: profile,
      message: "Profile retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUserDto,
  ) {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return {
      data: updated,
      message: "Profile updated",
      timestamp: new Date().toISOString(),
    };
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    const user = await this.usersService.findById(id);
    return {
      data: user,
      message: "User retrieved",
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return {
      data: user,
      message: "User updated",
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string) {
    await this.usersService.remove(id);
  }
}
