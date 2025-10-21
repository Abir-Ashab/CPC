import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vote, VoteDocument } from './vote.schema';
import { Photo, PhotoDocument } from '../photo/photo.schema';
import { VotingSettings, VotingSettingsDocument } from './voting-settings.schema';
import { User } from '../users/schema/user.schema';
import { Role } from '../users/dto/user.dto';

@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(VotingSettings.name) private votingSettingsModel: Model<VotingSettingsDocument>,
  ) {}

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
    updates: Partial<VotingSettings>
  ): Promise<VotingSettingsDocument> {
    if (user.role !== Role.ADMIN && user.email !== 'abir.ashab@cefalo.com') {
      throw new ForbiddenException('Only admin can modify voting settings');
    }

    let settings = await this.getVotingSettings();
    return await this.votingSettingsModel.findByIdAndUpdate(
      settings._id,
      updates,
      { new: true, upsert: true }
    );
  }

  async startVoting(user: User): Promise<VotingSettingsDocument> {
    if (user.role !== Role.ADMIN && user.email !== 'abir.ashab@cefalo.com') {
      throw new ForbiddenException('Only admin can start voting');
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
    if (user.role !== Role.ADMIN && user.email !== 'abir.ashab@cefalo.com') {
      throw new ForbiddenException('Only admin can stop voting');
    }

    return await this.updateVotingSettings(user, {
      isVotingActive: false,
      votingEndTime: new Date(),
    });
  }

  async vote(photoId: string, user: User): Promise<{ success: boolean; message: string }> {
    const settings = await this.getVotingSettings();
    
    if (!settings.isVotingActive) {
      throw new BadRequestException('Voting is not currently active');
    }

    // Check if photo exists
    const photo = await this.photoModel.findById(photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    // Check if user has already voted
    const existingVote = await this.voteModel.findOne({ userId: user._id });
    if (existingVote) {
      throw new BadRequestException('You have already voted');
    }

    // Create the vote
    await this.voteModel.create({
      photoId: new Types.ObjectId(photoId),
      userId: user._id,
      userEmail: user.email,
      votedAt: new Date(),
    });

    // Update photo vote count
    await this.photoModel.findByIdAndUpdate(photoId, {
      $inc: { voteCount: 1 }
    });

    return {
      success: true,
      message: 'Vote recorded successfully'
    };
  }

  async getUserVote(userId: string): Promise<Vote | null> {
    return await this.voteModel.findOne({ userId: new Types.ObjectId(userId) })
      .populate('photoId');
  }

  async getVotingAnalytics(user: User): Promise<any> {
    if (user.role !== Role.ADMIN && user.email !== 'abir.ashab@cefalo.com') {
      throw new ForbiddenException('Only admin can view analytics');
    }

    const [totalVotes, photosWithVotes, settings] = await Promise.all([
      this.voteModel.countDocuments(),
      this.photoModel.find().sort({ voteCount: -1 }),
      this.getVotingSettings(),
    ]);

    return {
      totalVotes,
      totalPhotos: photosWithVotes.length,
      photosWithVotes: photosWithVotes.map(photo => ({
        id: photo._id,
        name: photo.name,
        voteCount: photo.voteCount,
        participantName: photo.participantName,
        participantEmail: photo.participantEmail,
        isWinner: photo.isWinner,
        winnerPosition: photo.winnerPosition,
      })),
      votingSettings: settings,
    };
  }

  async declareWinners(user: User, winnerIds: string[]): Promise<{ success: boolean; message: string }> {
    if (user.role !== Role.ADMIN && user.email !== 'abir.ashab@cefalo.com') {
      throw new ForbiddenException('Only admin can declare winners');
    }

    if (winnerIds.length !== 3) {
      throw new BadRequestException('Must declare exactly 3 winners');
    }

    // Reset all photos to not be winners
    await this.photoModel.updateMany({}, {
      isWinner: false,
      winnerPosition: undefined
    });

    // Set the winners
    for (let i = 0; i < winnerIds.length; i++) {
      await this.photoModel.findByIdAndUpdate(winnerIds[i], {
        isWinner: true,
        winnerPosition: i + 1
      });
    }

    // Update voting settings
    await this.updateVotingSettings(user, {
      winners: winnerIds,
      resultsPublished: true,
    });

    return {
      success: true,
      message: 'Winners declared successfully'
    };
  }

  async getWinners(): Promise<any[]> {
    const winners = await this.photoModel.find({ isWinner: true })
      .sort({ winnerPosition: 1 });

    return winners.map(photo => ({
      id: photo._id,
      name: photo.name,
      url: photo.url,
      voteCount: photo.voteCount,
      participantName: photo.participantName,
      participantEmail: photo.participantEmail,
      winnerPosition: photo.winnerPosition,
    }));
  }
}