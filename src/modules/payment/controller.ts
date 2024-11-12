import axios from 'axios';
import { Request, Response } from 'express';
import Payment from '../../model/payment.schemal';

export const verifyPayment = async (req: Request, res: Response) => {
  const { reference } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Check if Paystack's response confirms a successful payment
    if (response.data.status === 'success') {
      // Payment is successful
      const paymentDetails = response.data.data;

      // You can now store payment details (e.g., user, amount, date, etc.) in your database
      // Example:
      const paymentRecord = await Payment.create({
        // userId: paymentDetails.customer.id, // Assuming you have a user ID
        amount: paymentDetails.amount,
        paymentDate: paymentDetails.paid_at,
        transactionReference: paymentDetails.reference,
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