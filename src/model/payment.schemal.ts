import mongoose, { Schema, Model, Document } from 'mongoose';

interface IPayment extends Document {
  amount: number;
  paymentDate: Date; // Changed to Date for better MongoDB functionality
  transactionReference: string;
  status: string;
  channel: string;
}

interface IPaymentModel extends Model<IPayment> {
  findAll(): Promise<IPayment[]>; // Type definition for static method
}

const paymentSchema = new Schema<IPayment>(
  {
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) => value > 0,
        message: 'Amount must be greater than zero',
      },
    },
    paymentDate: { type: Date, required: true }, // Changed to Date
    transactionReference: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    channel: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Static Method
paymentSchema.statics.findAll = async function () {
  try {
    return await this.find({}).lean(); // Use lean for performance
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Error fetching payments');
  }
};

const Payment: IPaymentModel = mongoose.model<IPayment, IPaymentModel>(
  'Payment',
  paymentSchema
);

export default Payment;
