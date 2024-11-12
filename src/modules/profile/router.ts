import express, { RequestHandler } from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  authenticateUser,
} from './controller';

const router = express.Router();

// Route to create a profile
router.post('/profile', createProfile as unknown as RequestHandler);

// Route to get a profile by userId
router.get(
  '/profile',
  // authenticateUser as unknown as RequestHandler,
  getProfile as unknown as RequestHandler
);

// Route to update a profile by userId
router.put('/profile/:userId', updateProfile as unknown as RequestHandler);

// Route to delete a profile by userId
router.delete('/profile/:userId', deleteProfile as unknown as RequestHandler);

export default router;
