import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Photo, PhotoDocument } from "./photo.schema";
import { MinioService } from "./minio.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class PhotoService {
  constructor(
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    private minioService: MinioService,
  ) {}

  async uploadPhoto(
    file: Express.Multer.File,
    uploadedBy: string,
    photoName: string,
  ): Promise<Photo> {
    // Generate unique filename
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Upload to MinIO
    await this.minioService.uploadFile(fileName, file.buffer, file.mimetype);

    // Get presigned URL
    const url = await this.minioService.getFileUrl(fileName);

    // Save metadata to MongoDB
    const photo = new this.photoModel({
      name: photoName || file.originalname,
      fileName: fileName,
      url: url,
      uploadedBy: uploadedBy,
      contentType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    });

    return await photo.save();
  }

  async getAllPhotos(): Promise<any[]> {
    const photos = await this.photoModel.find().sort({ uploadedAt: -1 }).exec();

    // Return photos without uploadedBy info (anonymous)
    return await Promise.all(
      photos.map(async (photo) => {
        const url = await this.minioService.getFileUrl(photo.fileName);
        return {
          id: photo._id,
          name: photo.name,
          url: url,
          uploadedAt: photo.uploadedAt,
        };
      }),
    );
  }

  async deletePhoto(id: string): Promise<void> {
    const photo = await this.photoModel.findById(id);
    if (!photo) {
      throw new Error("Photo not found");
    }

    // Delete from MinIO
    await this.minioService.deleteFile(photo.fileName);

    // Delete from database
    await this.photoModel.findByIdAndDelete(id);
  }
}
