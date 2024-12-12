import { WEBHOOKS_FOR_BUY } from '../../common/constants.js';
import { handleSellSignal, handleBuySignal, getTradingDayLimit } from '../../common/helpers/signalsHandler.js';
import TradingModel from '../../models/trading.js';

export const sendEmail = async (req, res, next) => {
	try {
		const { alertType } = req.body;

		if (alertType === 'buy') {
			// handle buy signal
			await handleBuySignal(req.body);
		} else {
			const previous10PM = getTradingDayLimit(22); // Get time limit by 10 PM (22:00)
			const previous7PM = getTradingDayLimit(19); // Get time limit by 7 PM (19:00)
			const buyingTrade = await TradingModel.findOne({
				webhookName: {
					$in: Object.values({
						GREEN_ARROW: 'green arrow',
						GREEN_KEY: 'green key',
						GREEN_SURF: 'green surf',
					})
				},
				createdAt: { $gte: previous7PM },
			})
				.exec();

			if (!buyingTrade) return res.status(200).send('Buy not exist');
			if (buyingTrade?.webhookName === WEBHOOKS_FOR_BUY.GREEN_ARROW && buyingTrade?.createdAt < previous10PM) return res.status(200).send('Buy not exist');
			if (buyingTrade?.webhookName === WEBHOOKS_FOR_BUY.GREEN_KEY && buyingTrade?.createdAt < previous7PM) return res.status(200).send('Buy not exist');
			if (buyingTrade?.webhookName === WEBHOOKS_FOR_BUY.GREEN_SURF && buyingTrade?.createdAt < previous7PM) return res.status(200).send('Buy not exist');
			// handle sell signal
			await handleSellSignal(req.body);
		}
		await TradingModel.create(req.body);
		return res.status(200).send('Email sent successfully');
	} catch (e) {
		return next(e);
	}
};
