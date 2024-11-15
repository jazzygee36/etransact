import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the profile data
export interface IProfile extends Document {
  
  userId: mongoose.Schema.Types.ObjectId; // Reference to the user document
  username: string;
  phoneNumber: string;
  email: string;
  payments: Array<{
    transactionReference: string;
    amount: number;
    paymentDate: Date;
    status: string;
    channel: string;
  }>;
  updatedAt: Date;
  createdAt: Date;
}

// Define the structure for a single payment
const paymentSchema = new Schema(
  {
    transactionReference: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    status: { type: String, required: true },
    channel: { type: String, required: true },
  },
  { _id: false } // Prevents Mongoose from creating _id for each payment entry
);

// Define the Profile schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payments: [
    {
      transactionReference: String,
      amount: Number,
      paymentDate: Date,
      status: String,
      channel: String,
    },
  ],
});
// Create and export the Profile model
const Profile = mongoose.model<IProfile>('Profile', profileSchema);
export default Profile;
