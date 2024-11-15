import { Request, Response } from 'express';
import User from '../../model/user.schemal';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Profile, { IProfile } from '../../model/profile.shemal';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET;
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export const handleUserResgistration = async (req: Request, res: Response) => {
  const { username, email, phoneNumber, password } = req.body;

  if (!username || !email || !phoneNumber || !password) {
    return res.status(401).json({ message: 'All input fields are required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(401).json({ message: 'Email already exists' });
    }

    const existPhoneNumber = await User.findOne({ phoneNumber });
    if (existPhoneNumber) {
      return res.status(401).json({ message: 'Phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      [
        {
          username,
          email,
          phoneNumber,
          password: hashedPassword,
          isVerified: false,
        },
      ],
      { session }
    );

    if (email) {
      const newProfile = new Profile({
        userId: user[0]._id,
        username,
        phoneNumber,
        email,
      });
      await newProfile.save({ session });
    }

    const token = jwt.sign(
      { id: user[0]._id.toString() },
      JWT_SECRET as string,
      {
        expiresIn: '1h',
      }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `https://e-recharge.netlify.app/api/verify-email/${token}`;
    await transporter.sendMail({
      to: email,
      subject: `e-Recharge Verify Your Email Address`,
      html: `<p>Welcome to eRecharge, ${username}! Please verify your email by clicking the link below:</p>
             <p><a href="${verificationLink}">Verify Email</a></p>`,
    });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    // Rollback the transaction if any error occurs
    await session.abortTransaction();
    session.endSession();

    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string };

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the user by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.redirect('https://e-recharge.netlify.app/login'); // Redirect if already verified
    }

    // Mark the user as verified and save
    user.isVerified = true;
    await user.save();

    // Redirect to the dashboard after successful verification
    return res.redirect('https://e-recharge.netlify.app/login');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid or malformed token' });
    }
    console.error('Error verifying email:', error); // More detailed error logging
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(401)
      .json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Username not found' });
    }

    // Compare the provided password with the stored password
    const comparePwd = await bcrypt.compare(password, user.password);
    if (!comparePwd) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token with the user profile ID in the payload
    const token = jwt.sign(
      {
        username: user.username,
        userId: user.id,
      },
      process.env.JWT_SECRET as string, // Use the JWT secret from environment variables
      { expiresIn: '1h' } // Token expiration time
    );

    // Return response with the user profile and token
    return res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({ message: error });
  }
};
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your SMTP username
        pass: process.env.EMAIL_PASS, // your SMTP password
      },
    });
    // // Generate password reset token
    // const token = jwt.sign({ id: user.id }, JWT_SECRET as string, {
    //   expiresIn: '1h', // token expires in 1 hour
    // });

    // Create reset password link
    const resetLink = `https://e-recharge.netlify.app/reset-password`;
    // `https://etransact.vercel.app/api/reset-password/${token}`;

    // Send reset email
    await transporter.sendMail({
      to: email,
      subject: 'e-Recharge, Reset Your Password',
      html: `<p>Click the link below to reset your password:</p>
             <p><a href="${resetLink}">Reset Password</a></p>`,
    });

    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as any
    ) as CustomJwtPayload;
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};
