import { Router } from 'express';
import trading from './trading.js';
import email from './email.js';

const router = Router();

router.use('/trading', trading);
router.use('/mail', email);

export default router;
