import { Request, Response } from 'express';
import User from '../../model/user.schemal';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET;
interface CustomJwtPayload extends JwtPayload {
  id: string;
}

export const handleUserResgistration = async (req: Request, res: Response) => {
  const { username, email, phoneNumber, password } = req.body;
  if (!username || !email || !phoneNumber || !password) {
    return res.status(401).json({ message: 'all input fields required' });
  }
  const existEmail = await User.findOne({ email });
  if (existEmail) {
    return res.status(401).json({ message: 'email already exist' });
  }

  const existPhoneNumber = await User.findOne({ phoneNumber });
  if (existPhoneNumber) {
    return res.status(401).json({ message: 'phone number already exist' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      isVerified: false, // Track verification status
    });

    // Generate verification token
    const token = jwt.sign({ id: user.id }, JWT_SECRET as string, {
      expiresIn: '1h', // Consider increasing if needed
    });

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your SMTP username
        pass: process.env.EMAIL_PASS, // your SMTP password
      },
    });

    // Create verification link
    const verificationLink = `https://etransact.vercel.app/api/verify-email/${token}`;

    // Send verification email
    await transporter.sendMail({
      to: email,
      subject: `e-Recharge Verify Your Email Address`,
      html: `<p>Welcome to eRecharge, ${username}! Please verify your email by clicking the link below:</p>
               <p><a href="${verificationLink}">Verify Email</a></p>`,
    });

    return res.status(200).json({ message: `Registered successful` });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string };
    const user = await User.findOne({ id: decoded.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.redirect('https://e-recharge.netlify/login'); // Redirect to login page
    }

    user.isVerified = true;
    await user.save();

    return res.redirect('https://e-recharge.netlify.app/dashboard'); // Redirect to welcome page
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(401).json({ message: 'username & password is required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'username not found' });
    }
    const comparePwd = await bcrypt.compare(password, user.password);

    if (!comparePwd) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username }, // Payload
      JWT_SECRET as string, // Secret key from your environment variables
      { expiresIn: '1h' } // Token expiration time
    );
    return res.status(200).json({ message: 'login successful', token });
  } catch (error) {
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
