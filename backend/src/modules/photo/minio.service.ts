import { Injectable } from "@nestjs/common";
import { Client } from "minio";

@Injectable()
export class MinioService {
  private minioClient: Client;
  private bucketName: string;

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: parseInt(process.env.MINIO_PORT || "9000"),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    });

    this.bucketName = process.env.MINIO_BUCKET_NAME || "photos";
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, "us-east-1");

        // Set public read policy
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy),
        );
        console.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      console.error("Error initializing bucket:", error);
    }
  }

  async uploadFile(
    fileName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      buffer,
      buffer.length,
      {
        "Content-Type": contentType,
      },
    );
  }

  async getFileUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(
      this.bucketName,
      fileName,
      24 * 60 * 60, // 24 hours
    );
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  getBucketName(): string {
    return this.bucketName;
  }
}
