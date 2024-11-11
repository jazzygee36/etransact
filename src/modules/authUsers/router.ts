import express, { RequestHandler } from 'express';
import { handleUserResgistration, verifyEmail } from './controller';

const router = express.Router();

router.post('/register', handleUserResgistration as unknown as RequestHandler);
router.get('/verify-email/:token', verifyEmail as unknown as RequestHandler);

export default router;
