import express from 'express';
import { getTradings, createTrade } from '../controllers/trading.js';

const router = express.Router();

// GET all tradings
router.get('/', getTradings);

// Create new trade
router.post('/create', createTrade);

export default router;
