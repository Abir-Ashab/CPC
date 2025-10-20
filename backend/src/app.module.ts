import { envVars } from "./config/env";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [MongooseModule.forRoot(envVars.MONGODB_URI), UsersModule],
})
export class AppModule {}
