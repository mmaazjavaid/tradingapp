// Package gitup repo: https://github.com/binance/binance-connector-node/blob/master/examples/spot/trade/newOrder.js
import { Spot } from '@binance/connector';
import dotenv from 'dotenv';
dotenv.config();

class BinanceClient {
	constructor() {
		this.client = new Spot(process.env.BINANCE_API_KEY, process.env.BINANCE_API_SECRET);
	}

	// Get account information
	async getAccountInfo() {
		try {
			const account = await this.client.account();
			// this.client.logger.log(response.data);
			return account.data;
		} catch (error) {
			console.error('Error fetching acount:', error.message);
			throw error;
		}
	}

	async placeMarketOrder() {
		try {
			const order = await this.client.newOrder('BNBUSDT', 'BUY', 'MARKET', {
				quantity: 1,
			});
			return order.data;
		} catch (error) {
			console.error('Error placing order:', error.message);
			throw error;
		}
	}
}

export default BinanceClient;
