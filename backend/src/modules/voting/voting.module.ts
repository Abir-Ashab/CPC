import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { Vote, VoteSchema } from './vote.schema';
import { VotingSettings, VotingSettingsSchema } from './voting-settings.schema';
import { PhotoModule } from '../photo/photo.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vote.name, schema: VoteSchema },
      { name: VotingSettings.name, schema: VotingSettingsSchema },
    ]),
    forwardRef(() => PhotoModule),
  ],
  controllers: [VotingController],
  providers: [VotingService],
  exports: [VotingService],
})
export class VotingModule {}