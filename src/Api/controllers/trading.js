import TradingModel from '../../models/trading.js';

export const getTradings = async (req, res, next) => {
	try {
		const tradings = await TradingModel.find();
		return res.status(200).send(tradings);
	} catch (e) {
		return next(e);
	}
};
