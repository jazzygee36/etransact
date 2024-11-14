import express, { RequestHandler } from 'express';
import { getUserProfile, authenticateToken } from './controller';

const router = express.Router();

// Route to get a profile by userId
router.get(
  '/profile',
  authenticateToken as unknown as RequestHandler,
  getUserProfile as unknown as RequestHandler
);

export default router;
