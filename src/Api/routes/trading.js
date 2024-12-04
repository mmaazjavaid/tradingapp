import express from 'express';
import { getTradings } from '../controllers/trading.js';

const router = express.Router();

// GET all tradings
router.get('/', getTradings);

export default router;
