import { Request, Response, NextFunction } from 'express';
import Profile, { IProfile } from '../../model/profile.shemal';
import jwt from 'jsonwebtoken';
import User from '../../model/user.schemal';
import { IUser } from '../../model/user.schemal';

declare module 'express' {
  export interface Request {
    userId?: string; // Add userId as an optional property
  }
}

type PopulatedUser = IUser & { profile: IProfile };

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');

    console.table(decoded);
    if (decoded?.userId) {
      req.userId = decoded?.userId;
      next();
    } else {
      return res.sendStatus(403);
    }
  } catch (err) {
    return res.sendStatus(403);
  }
};
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
