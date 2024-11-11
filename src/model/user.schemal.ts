import mongoose, { Schema, Model, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  id?: number;
}

interface IUserModel extends Model<IUser> {
  findAll(): Promise<IUser[]>;
}

const userSchema = new Schema<IUser>({
  id: { type: Number },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

userSchema.statics.findAll = function () {
  return this.find({});
};

const User: IUserModel = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
