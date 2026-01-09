/* @Schema() → MongoDB collection
   @Prop() → field
   unique → no duplicate email/username
   timestamps → createdAt, updatedAt automatically*/

//src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ unique: true, required: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: 'customer' })
    role: 'customer' | 'cashier' | 'delivery' | 'admin';

    @Prop()
    firstname: string;

    @Prop()
    lastname: string;

    @Prop({ unique: true })
    phone: string;

    @Prop()
    dob: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    otp: string;

    @Prop()
    otpExpiresAt: Date;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: null })
    profileImage: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
