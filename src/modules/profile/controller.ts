import { Request, Response, NextFunction } from 'express';
import Profile from '../../model/profile.shemal';
import jwt from 'jsonwebtoken'


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

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId; 

  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};


// Update a profile by userId
export const updateProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { firstName, lastName, email, avatarUrl, bio, phoneNumber } = req.body;

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { firstName, lastName, email, avatarUrl, bio, phoneNumber },
      { new: true } // Return the updated document
    );

    if (!updatedProfile) {
      return res
        .status(404)
        .json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error updating profile' });
  }
};

// Delete a profile by userId
export const deleteProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const deletedProfile = await Profile.findOneAndDelete({ userId });

    if (!deletedProfile) {
      return res
        .status(404)
        .json({ success: false, message: 'Profile not found' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting profile',
    });
  }
};
