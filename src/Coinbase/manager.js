import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

dotenv.config();

class CoinbaseTrader {
	constructor() {
		this.coinbaseClient = axios.create({
			baseURL: 'https://api.exchange.coinbase.com',
			headers: {
				'CB-VERSION': process.env.COINBASE_API_VERSION,
				Authorization: `Bearer ${process.env.COINBASE_API_KEY}`,
			},
		});

		// this.coinbaseClient = axios.create({
		// 	baseURL: 'https://api.coinbase.com/v3',
		// 	headers: {
		// 		'CB-VERSION': process.env.COINBASE_API_VERSION,
		// 		'Content-Type': 'application/json',
		// 	},
		// });
		this.apiKey = `${process.env.COINBASE_API_KEY}`;
		this.apiSecret = `${process.env.COINBASE_API_SECRET}`;
		this.apiUrl = `${process.env.COINBASE_API_URL}`;
	}

	_generateHeaders(method, requestPath, body = '') {
		// create the json request object
		const cb_access_timestamp = Date.now() / 1000; // in ms
		const cb_access_passphrase = '...';

		// Create the prehash string by concatenating required parts
		const prehash = `${cb_access_timestamp}${method}${requestPath}${body}`;

		// Decode the base64 secret
		const key = Buffer.from(this.apiSecret, 'base64');

		// create a sha256 hmac with the secret
		const hmac = crypto.createHmac('sha256', key);

		// sign the require message with the hmac and base64 encode the result
		const cb_access_sign = hmac.update(prehash).digest('base64');

		return {
			'CB-ACCESS-KEY': this.apiKey,
			'CB-ACCESS-SIGN': cb_access_sign,
			'CB-ACCESS-TIMESTAMP': cb_access_timestamp,
			// 'CB-ACCESS-PASSPHRASE': cb_access_passphrase,
			'Content-Type': 'application/json',
		};
	}

	async getAccounts() {
		const method = 'GET';
		const requestPath = '/orders';

		try {
			const headers = this._generateHeaders(method, requestPath);
			// Make the request with the correct URL and headers
			const response = await axios.get(`${'https://api.exchange.coinbase.com'}${requestPath}`, { headers });
			console.log('Balances:', response.data);
			return response.data;
		} catch (error) {
			console.error('Error fetching balances:', error.response?.data || error.message);
			throw error;
		}
	}

	async getCurrencies() {
		try {
			const response = await this.coinbaseClient.get('/currencies');
			console.log(response.data);
		} catch (error) {
			console.error('Error fetching currencies:', error.message);
		}
	}
}

export default CoinbaseTrader;
