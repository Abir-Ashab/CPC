import { envVars } from "./config/env";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PhotoModule } from "./modules/photo/photo.module";

@Module({
  imports: [
    MongooseModule.forRoot(envVars.MONGODB_URI),
    UsersModule,
    AuthModule,
    // PhotoModule
  ],
})
export class AppModule {}
