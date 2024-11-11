import express, { RequestHandler } from 'express';
import { handleUserResgistration } from './controller';

const router = express.Router();

router.post('/register', handleUserResgistration as unknown as RequestHandler);

export default router;
