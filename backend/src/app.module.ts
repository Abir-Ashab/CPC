import { envVars } from "./config/env";
import { Module } from "@nestjs/common";
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PhotoModule } from "./modules/photo/photo.module";
import { VotingModule } from "./modules/voting/voting.module";

@Module({
  imports: [
    MongooseModule.forRoot(envVars.MONGODB_URI),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    PhotoModule,
    VotingModule,
  ],
})
export class AppModule {}
