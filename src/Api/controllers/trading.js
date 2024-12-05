import TradingModel from '../../models/trading.js';

export const getTradings = async (req, res, next) => {
	try {
		const tradings = await TradingModel.find();
		return res.status(200).send(tradings);
	} catch (e) {
		return next(e);
	}
};

export const createTrade = async (req, res, next) => {
	try {
		const trade = req.body;
		const createdTrade = await TradingModel.create(trade);
		return res.status(201).send(createdTrade);
	} catch (e) {
		return next(e);
	}
};
