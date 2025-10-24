import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./schema/user.schema";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(query?: string, role?: string): Promise<User[]> {
    const filter: any = {};

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    return this.userModel.find(filter).populate('votedPhotoId').exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).populate('votedPhotoId').exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).populate('votedPhotoId').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).populate('votedPhotoId').exec();
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('votedPhotoId')
      .exec();
  }

  // New method to find users who voted for a specific photo
  async findVotersByPhotoId(photoId: string): Promise<User[]> {
    return this.userModel.find({ votedPhotoId: photoId }).exec();
  }

  // New method to reset all votes
  async resetAllVotes(): Promise<void> {
    await this.userModel.updateMany(
      { votedPhotoId: { $ne: null } },
      {
        votedPhotoId: null,
        votedAt: null
      }
    );
  }
}