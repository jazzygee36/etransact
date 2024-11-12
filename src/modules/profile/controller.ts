import { Request, Response } from 'express';
import Profile from '../../model/profile.shemal';

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

// Get a profile by userId
export const getProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: 'Profile not found' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: 'Error fetching profile' });
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
