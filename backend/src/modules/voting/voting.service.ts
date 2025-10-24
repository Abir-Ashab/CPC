import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Photo, PhotoDocument } from "../photo/photo.schema";
import {
  VotingSettings,
  VotingSettingsDocument,
} from "./voting-settings.schema";
import { User, UserDocument } from "../users/schema/user.schema";
import { Role } from "../users/dto/user.dto";
import { MinioService } from "../photo/minio.service";
import { UsersService } from "../users/users.service";
import { PhotoService } from "../photo/photo.service";

@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(VotingSettings.name)
    private votingSettingsModel: Model<VotingSettingsDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private minioService: MinioService,
    private usersService: UsersService,
    private photoService: PhotoService,
  ) { }

  async getVotingSettings(): Promise<VotingSettingsDocument> {
    let settings = await this.votingSettingsModel.findOne();
    if (!settings) {
      settings = await this.votingSettingsModel.create({
        isVotingActive: false,
        maxVotesPerUser: 1,
        winners: [],
        resultsPublished: false,
      });
    }
    return settings;
  }

  async updateVotingSettings(
    user: User,
    updates: Partial<VotingSettings>,
  ): Promise<VotingSettingsDocument> {
    if (user.role !== Role.ADMIN && user.email !== "abir.ashab@cefalo.com") {
      throw new ForbiddenException("Only admin can modify voting settings");
    }

    let settings = await this.getVotingSettings();
    return await this.votingSettingsModel.findByIdAndUpdate(
      settings._id,
      updates,
      { new: true, upsert: true },
    );
  }

  async startVoting(user: User): Promise<VotingSettingsDocument> {
    if (user.role !== Role.ADMIN && user.email !== "abir.ashab@cefalo.com") {
      throw new ForbiddenException("Only admin can start voting");
    }

    return await this.updateVotingSettings(user, {
      isVotingActive: true,
      votingStartTime: new Date(),
      votingEndTime: null,
      winners: [],
      resultsPublished: false,
    });
  }

  async stopVoting(user: User): Promise<VotingSettingsDocument> {
    if (user.role !== Role.ADMIN && user.email !== "abir.ashab@cefalo.com") {
      throw new ForbiddenException("Only admin can stop voting");
    }

    return await this.updateVotingSettings(user, {
      isVotingActive: false,
      votingEndTime: new Date(),
    });
  }

  async vote(
    photoId: string,
    user: User,
  ): Promise<{ success: boolean; message: string }> {
    const settings = await this.getVotingSettings();

    if (!settings.isVotingActive) {
      throw new BadRequestException("Voting is not currently active");
    }

    // Check if photo exists
    const photo = await this.photoService.findById(photoId);
    if (!photo) {
      throw new NotFoundException("Photo not found");
    }

    if (!user || !user._id) {
      throw new BadRequestException("User authentication required");
    }

    // Check if user has already voted using votedPhotoId
    const currentUser = await this.usersService.findById(user._id.toString());
    if (currentUser?.votedPhotoId) {
      throw new BadRequestException("You have already voted");
    }

    // Update user's votedPhotoId and votedAt
    await this.usersService.updateUser(user._id.toString(), {
      votedPhotoId: photoId,
      votedAt: new Date(),
    });

    // Increment photo vote count
    await this.photoService.incrementVoteCount(photoId);

    return {
      success: true,
      message: "Vote recorded successfully",
    };
  }

  async getUserVote(userId: string): Promise<{ votedPhotoId?: string; votedAt?: Date }> {
    const user = await this.usersService.findById(userId);
    return {
      votedPhotoId: user?.votedPhotoId?.toString(),
      votedAt: user?.votedAt,
    };
  }

  async getVotingAnalytics(user: User): Promise<any> {
    if (user.role !== Role.ADMIN && user.email !== "abir.ashab@cefalo.com") {
      throw new ForbiddenException("Only admin can view analytics");
    }

    const [totalVotes, photosWithVotes, settings, allUsers] = await Promise.all([
      this.userModel.countDocuments({ votedPhotoId: { $ne: null } }),
      this.photoModel.find().sort({ voteCount: -1 }),
      this.getVotingSettings(),
      this.userModel.find({ votedPhotoId: { $ne: null } }).populate('votedPhotoId'),
    ]);

    const photosWithRegeneratedUrls = await Promise.all(
      photosWithVotes.map(async (photo) => ({
        id: photo._id,
        name: photo.name,
        url: await this.minioService.getFileUrl(photo.fileName),
        voteCount: photo.voteCount,
        participantName: photo.participantName,
        participantEmail: photo.participantEmail,
        isWinner: photo.isWinner,
        winnerPosition: photo.winnerPosition,
        voters: allUsers
          .filter(u => u.votedPhotoId && u.votedPhotoId.toString() === photo._id.toString())
          .map(u => ({ email: u.email, name: u.name, votedAt: u.votedAt }))
      })),
    );

    return {
      totalVotes,
      totalPhotos: photosWithVotes.length,
      totalUsers: allUsers.length,
      photosWithVotes: photosWithRegeneratedUrls,
      votingSettings: settings,
    };
  }

  async declareWinners(
    user: User,
    winnerIds: string[],
  ): Promise<{ success: boolean; message: string }> {
    if (user.role !== Role.ADMIN && user.email !== "abir.ashab@cefalo.com") {
      throw new ForbiddenException("Only admin can declare winners");
    }

    if (winnerIds.length !== 3) {
      throw new BadRequestException("Must declare exactly 3 winners");
    }

    await this.photoModel.updateMany(
      {},
      {
        isWinner: false,
        winnerPosition: undefined,
      },
    );

    for (let i = 0; i < winnerIds.length; i++) {
      await this.photoModel.findByIdAndUpdate(winnerIds[i], {
        isWinner: true,
        winnerPosition: i + 1,
      });
    }

    await this.updateVotingSettings(user, {
      winners: winnerIds,
      resultsPublished: true,
    });

    return {
      success: true,
      message: "Winners declared successfully",
    };
  }

  async getWinners(): Promise<any[]> {
    const winners = await this.photoModel
      .find({ isWinner: true })
      .sort({ winnerPosition: 1 });

    return await Promise.all(
      winners.map(async (photo) => ({
        id: photo._id,
        name: photo.name,
        url: await this.minioService.getFileUrl(photo.fileName),
        voteCount: photo.voteCount,
        participantName: photo.participantName,
        participantEmail: photo.participantEmail,
        winnerPosition: photo.winnerPosition,
      })),
    );
  }

  // NEW: Reset everything
  async resetVoting(user: User): Promise<{ success: boolean; message: string }> {
    if (user.role !== Role.ADMIN && user.email !== "abir.ashab@cefalo.com") {
      throw new ForbiddenException("Only admin can reset voting");
    }

    // Reset voting settings
    await this.updateVotingSettings(user, {
      isVotingActive: false,
      votingStartTime: null,
      votingEndTime: null,
      winners: [],
      resultsPublished: false,
    });

    // Reset all user votes
    await this.usersService.resetAllVotes();

    // Reset all photo vote counts and winner status
    await this.photoService.resetAllPhotos();

    return {
      success: true,
      message: "Voting system reset successfully",
    };
  }
}