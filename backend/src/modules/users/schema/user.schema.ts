import { Role } from "../dto/user.dto";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  avatar?: string;

  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.USER,
  })
  role: Role;

  @Prop()
  googleId?: string;

  @Prop({ type: Types.ObjectId, ref: "Photo", required: false })
  votedPhotoId?: Types.ObjectId;

  @Prop()
  votedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);