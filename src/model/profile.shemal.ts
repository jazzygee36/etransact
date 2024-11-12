import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the profile data
export interface IProfile extends Document {
  userId?: mongoose.Schema.Types.ObjectId; // Reference to the user document
  username: string;
  phoneNumber: string;
  email: string;

  updatedAt: Date;
  createdAt: Date;
  payments: Array<{
    transactionReference: string;
    amount: number;
    paymentDate: Date;
    status: string;
    channel: string;
  }>;
}

// Define the structure for a single payment
const paymentSchema = new Schema(
  {
    transactionReference: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: { type: String },
    channel: { type: String },
  },
  { _id: false }
);

// Define the Profile schema
const profileSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    amount: { type: String },
    paymentDate: { type: String },
    status: { type: String },
    channel: { type: String },
    transactionReference: { type: String },
    payments: { type: [paymentSchema], default: [] }, // Array of payment records
  },
  { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

// Create and export the Profile model
const Profile = mongoose.model<IProfile>('Profile', profileSchema);
export default Profile;
