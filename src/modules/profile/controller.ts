import { Request, Response, NextFunction } from 'express';
import Profile from '../../model/profile.shemal';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

// Create a new profile
export const createProfile = async (req: Request, res: Response) => {
  const {
    username,
    phoneNumber,
    email,
    amount,
    paymentDate,
    transactionReference,
    status,
    channel,
  } = req.body;

  try {
    const profile = new Profile({
      username,
      phoneNumber,
      email,
      amount,
      paymentDate,
      transactionReference,
      status,
      channel,
    });

    await profile.save();
    return res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error creating profile' });
  }
};


export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assumes 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }
  
  try {
    // Find the user by userId
    const user = await Profile.findById(userId); // Exclude password field

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};