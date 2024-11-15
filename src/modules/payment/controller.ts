import axios from 'axios';
import { Request, Response } from 'express';
import Payment from '../../model/payment.schemal';
import Profile from '../../model/profile.shemal';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export const verifyPayment = async (req: Request, res: Response) => {
  const { reference } = req.body;
  if (!reference) {
    return res
      .status(400)
      .json({ success: false, message: 'Reference is required' });
  }
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer sk_test_5db48005ee13caea412e0703440e21939aa133d3`,
        },
      }
    );
    console.log(response.data, 'resss');

    // Check if Paystack's response confirms a successful payment
    if (response.data.status === true) {
      // Payment is successful
      const paymentDetails = response.data.data;

      // You can now store payment details (e.g., user, amount, date, etc.) in your database
      // Example:
      await Payment.create({
        amount: paymentDetails.amount,
        paymentDate: paymentDetails.paid_at,
        transactionReference: paymentDetails.reference,
        channel: paymentDetails.channel,
        status: 'successful',
      });

      return res
        .status(200)
        .json({ success: true, message: 'Payment verified' });
    } else {
      // Handle failed payment
      return res
        .status(400)
        .json({ success: false, message: 'Payment not verified' });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
