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
    const verificationLink = `http://localhost:8000/api/verify-email/${token}`;

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
