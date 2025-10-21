import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Photo' })
  photoId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ default: Date.now })
  votedAt: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

// Ensure a user can only vote once per photo
VoteSchema.index({ photoId: 1, userId: 1 }, { unique: true });