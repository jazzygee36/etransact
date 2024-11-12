import express, { RequestHandler } from 'express';
import {
  handleUserResgistration,
  verifyEmail,
  loginUser,
  requestPasswordReset,
  resetPassword,
} from './controller';

const router = express.Router();

router.post('/register', handleUserResgistration as unknown as RequestHandler);
router.get('/verify-email/:token', verifyEmail as unknown as RequestHandler);

router.post('/login', loginUser as unknown as RequestHandler);

router.post(
  '/request-password-reset',
  requestPasswordReset as unknown as RequestHandler
);
router.post('/reset-password/', resetPassword as unknown as RequestHandler);

export default router;
