import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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
  participantEmail: string;

  @Prop()
  participantName: string;

  @Prop()
  participantSlackId: string;

  @Prop()
  participantTeam: string;

  @Prop()
  caption: string;

  @Prop()
  contentType: string;

  @Prop()
  size: number;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  @Prop({ default: 0 })
  voteCount: number;

  @Prop({ default: false })
  isWinner: boolean;

  @Prop()
  winnerPosition?: number; // 1, 2, or 3 for first, second, third place
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
