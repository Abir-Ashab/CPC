import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";
import { MinioService } from "./minio.service";
import { Photo, PhotoSchema } from "./photo.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Photo.name, schema: PhotoSchema },
    ]),
  ],
  controllers: [PhotoController],
  providers: [PhotoService, MinioService],
  exports: [PhotoService, MongooseModule],
})
export class PhotoModule {}
