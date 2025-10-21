import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VotingService } from './voting.service';
import { JwtAuthGuard } from '../auth/guards/auth,guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '../users/dto/user.dto';

@Controller('voting')
@UseGuards(JwtAuthGuard)
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Get('settings')
  async getVotingSettings() {
    const settings = await this.votingService.getVotingSettings();
    return { settings };
  }

  @Put('settings')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateVotingSettings(@Request() req, @Body() updates: any) {
    const settings = await this.votingService.updateVotingSettings(req.user, updates);
    return { settings };
  }

  @Post('start')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async startVoting(@Request() req) {
    const settings = await this.votingService.startVoting(req.user);
    return { 
      message: 'Voting started successfully',
      settings 
    };
  }

  @Post('stop')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async stopVoting(@Request() req) {
    const settings = await this.votingService.stopVoting(req.user);
    return { 
      message: 'Voting stopped successfully',
      settings 
    };
  }

  @Post('vote/:photoId')
  async vote(@Param('photoId') photoId: string, @Request() req) {
    const result = await this.votingService.vote(photoId, req.user);
    return result;
  }

  @Get('my-vote')
  async getMyVote(@Request() req) {
    const vote = await this.votingService.getUserVote(req.user._id);
    return { vote };
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAnalytics(@Request() req) {
    const analytics = await this.votingService.getVotingAnalytics(req.user);
    return { analytics };
  }

  @Post('winners')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async declareWinners(@Request() req, @Body('winnerIds') winnerIds: string[]) {
    const result = await this.votingService.declareWinners(req.user, winnerIds);
    return result;
  }

  @Get('winners')
  async getWinners() {
    const winners = await this.votingService.getWinners();
    return { winners };
  }
}