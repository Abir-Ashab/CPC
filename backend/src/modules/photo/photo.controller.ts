import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PhotoService } from "./photo.service";

@Controller("photos")
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body("uploadedBy") uploadedBy: string,
    @Body("photoName") photoName: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    if (!uploadedBy) {
      throw new BadRequestException("uploadedBy is required");
    }

    const photo = await this.photoService.uploadPhoto(
      file,
      uploadedBy,
      photoName,
    );

    return {
      message: "Photo uploaded successfully",
      photo: {
        id: (photo as any)._id.toString(),
        name: photo.name,
        fileName: photo.fileName,
      },
    };
  }

  @Get()
  async getAllPhotos() {
    const photos = await this.photoService.getAllPhotos();
    return { photos };
  }

  @Delete(":id")
  async deletePhoto(@Param("id") id: string) {
    await this.photoService.deletePhoto(id);
    return { message: "Photo deleted successfully" };
  }
}
