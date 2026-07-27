import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { UserRepository } from "../../core/database/repositories";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      avatar: dto.avatar,
      githubId: dto.githubId,
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.userRepository.update(id, dto);
  }

  async updateProfile(id: string, dto: { name?: string; avatar?: string }) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.avatar !== undefined) updates.avatar = dto.avatar;

    const updated = await this.userRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundException("User not found");
    }

    const passwordHash = (updated as unknown as Record<string, unknown>).passwordHash;
    const { passwordHash: _, ...result } = { ...updated, passwordHash };
    return result;
  }

  async remove(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.userRepository.softDelete(id);
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    return isValid ? user : null;
  }
}
