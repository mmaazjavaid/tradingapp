import express from 'express';
import { sendEmail } from '../controllers/email.js';

const router = express.Router();

// Send email to user
router.post('/send-signal', sendEmail);

export default router;
