import { handleSellSignal, handleBuySignal } from '../../common/helpers/signalsHandler.js';
import TradingModel from '../../models/trading.js';

export const sendEmail = async (req, res, next) => {
	try {
		const { alertType } = req.body;

		if (alertType === 'buy') {
			// handle buy signal
			await handleBuySignal(req.body);
		} else {
			// handle sell signal
			await handleSellSignal(req.body);
		}
		await TradingModel.create(req.body);
		return res.status(200).send('Email sent successfully');
	} catch (e) {
		return next(e);
	}
};
