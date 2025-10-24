import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type VotingSettingsDocument = VotingSettings & Document;

@Schema({ timestamps: true })
export class VotingSettings {
  @Prop({ default: false })
  isVotingActive: boolean;

  @Prop()
  votingStartTime?: Date;

  @Prop()
  votingEndTime?: Date;

  @Prop({ type: [String], default: [] })
  winners: string[]; // Array of photo IDs

  @Prop({ default: false })
  resultsPublished: boolean;

  @Prop()
  maxVotesPerUser: number = 1;
}

export const VotingSettingsSchema =
  SchemaFactory.createForClass(VotingSettings);
