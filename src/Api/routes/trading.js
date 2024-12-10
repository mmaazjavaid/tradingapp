import express from 'express';
import { getTradings, createTrade } from '../controllers/trading.js';
import BinanceClient from '../../Binance/client.js';

const router = express.Router();

// GET all tradings
router.get('/', getTradings);

// Create new trade
router.post('/create', createTrade);

router.get('/test', async (req, res) => {
	const binanceClient = new BinanceClient();
	const account = await binanceClient.getAccountInfo();
	console.log('Account: ', account);
});

export default router;
