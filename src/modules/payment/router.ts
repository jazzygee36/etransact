import express, { RequestHandler } from 'express';
import { verifyPayment } from './controller';
const router = express.Router();

router.post('/verify-payment', verifyPayment as unknown as RequestHandler);

export default router;
