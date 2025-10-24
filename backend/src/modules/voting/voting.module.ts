import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { VotingController } from "./voting.controller";
import { VotingService } from "./voting.service";
import { VotingSettings, VotingSettingsSchema } from "./voting-settings.schema";
import { PhotoModule } from "../photo/photo.module";
import { UsersModule } from "../users/users.module";
import { User, UserSchema } from "../users/schema/user.schema";
import { Photo, PhotoSchema } from "../photo/photo.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VotingSettings.name, schema: VotingSettingsSchema },
      { name: User.name, schema: UserSchema },
      { name: Photo.name, schema: PhotoSchema },
    ]),
    forwardRef(() => PhotoModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [VotingController],
  providers: [VotingService],
  exports: [VotingService],
})
export class VotingModule { }