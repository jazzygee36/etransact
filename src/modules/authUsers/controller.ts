import { Request, Response } from 'express';
import User from '../../model/user.schemal';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET;

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
