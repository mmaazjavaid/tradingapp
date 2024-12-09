import express from 'express';
import { getTradings, createTrade } from '../controllers/trading.js';
import Coinbase from '../../Coinbase/manager.js';

const router = express.Router();

// GET all tradings
router.get('/', getTradings);

// Create new trade
router.post('/create', createTrade);

router.get('/test', async (req, res) => {
	const coinbase = new Coinbase();
    const accounts = await coinbase.getAccounts();
	console.log("Accounts: ", accounts);
});

export default router;
