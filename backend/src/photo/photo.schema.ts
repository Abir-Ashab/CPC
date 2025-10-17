import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhotoDocument = Photo & Document;

@Schema({ timestamps: true })
export class Photo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  uploadedBy: string;

  @Prop()
  contentType: string;

  @Prop()
  size: number;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
