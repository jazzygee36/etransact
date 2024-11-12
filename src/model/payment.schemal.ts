import mongoose, { Schema, Model, Document } from 'mongoose';

interface IPayment extends Document {
  amount: number;
  paymentDate: string;
  transactionReference: string;
  status: string;
  channel: string;
}

interface IPaymentModel extends Model<IPayment> {
  findAll(): Promise<IPayment[]>;
}

const paymentSchema = new Schema<IPayment>({
  amount: { type: Number, required: true },
  paymentDate: { type: String, required: true },
  transactionReference: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  channel: { type: String, required: true },
});

paymentSchema.statics.findAll = function () {
  return this.find({});
};

const Payment: IPaymentModel = mongoose.model<IPayment, IPaymentModel>(
  'Payment', // Corrected model name
  paymentSchema
);

export default Payment;
