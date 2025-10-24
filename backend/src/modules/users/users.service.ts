import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { User } from "./schema/user.schema";
import { CreateUserDto, UpdateUserDto, Role } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.email === "abir.ashab@cefalo.com") {
      createUserDto.role = Role.ADMIN;
    }
    return this.usersRepository.create(createUserDto);
  }

  async findAll(query?: string, role?: string): Promise<User[]> {
    return this.usersRepository.findAll(query, role);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findByGoogleId(googleId);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async updateUser(
    id: string,
    updateData: UpdateUserDto,
  ): Promise<User | null> {
    return this.usersRepository.update(id, updateData);
  }

  async findVotersByPhotoId(photoId: string): Promise<User[]> {
    return this.usersRepository.findVotersByPhotoId(photoId);
  }

  async resetAllVotes(): Promise<void> {
    return this.usersRepository.resetAllVotes();
  }
}