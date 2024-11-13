import express, { RequestHandler } from 'express';
import {
  createProfile,
  getUserProfile,

  authenticateUser,
} from './controller';

const router = express.Router();

// Route to create a profile
router.post('/profile', createProfile as unknown as RequestHandler);

// Route to get a profile by userId
router.get(
  '/profile/:userId',
    getUserProfile as unknown as RequestHandler
);


export default router;
