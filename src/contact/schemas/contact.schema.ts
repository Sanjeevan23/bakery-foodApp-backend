// src/contact/schemas/contact.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact {
  @Prop({ default: '' })
  companyName: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  landline: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  website: string;

  @Prop({ default: '' })
  aboutUs: string;

  @Prop({ type: [String], default: [] })
  termsOfService: string[];

  @Prop({ type: [String], default: [] })
  privacyPolicy: string[];
}

export const ContactSchema = SchemaFactory.createForClass(Contact);