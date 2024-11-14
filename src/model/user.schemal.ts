import mongoose, { Schema, Model, Document } from 'mongoose';
import { IProfile } from './profile.shemal';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  profile: IProfile | mongoose.Types.ObjectId; // Reference to IUserProfile or ObjectId
  isVerified: boolean;
}

interface IUserModel extends Model<IUser> {
  findAll(): Promise<IUser[]>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  isVerified: { type: Boolean, required: true },
});

userSchema.statics.findAll = function (): Promise<IUser[]> {
  return this.find({});
};

const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
