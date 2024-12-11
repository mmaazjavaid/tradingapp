import { WEBHOOKS_FOR_BUY, WEBHOOKS_FOR_SELL } from "../constants.js";
import TradingModel from '../../models/trading.js'
import { sendEmail } from "./sendEmail.js";

const getTradingDayLimit = (timeLimit) => {
    // Current date and time
    let result = new Date();

    // Check if the time is before time limit
    if (result.getHours() < timeLimit) {
        // Subtract one day
        result.setDate(result.getDate() - 1);
    }

    // Set the time by time limit
    result.setHours(timeLimit, 0, 0, 0);

    return result;
}

export const handleBuySignal = async (trade) => {

    const { webhookName, email, alertType, ticker } = trade;
    const emailPayload = { to: email, subject: alertType, text: `have coinbase buy ${ticker}` };
    const previous10PM = getTradingDayLimit(22); // Get time limit by 10 PM (22:00)
    const previous7PM = getTradingDayLimit(19); // Get time limit by 7 PM (19:00)

    switch (webhookName) {
        case WEBHOOKS_FOR_BUY.GREEN_ARROW:
            const lastTrade = await TradingModel.findOne({ email })
                .sort({ createdAt: -1 })
                .exec();

            if (lastTrade?.webhookName === WEBHOOKS_FOR_BUY.GREEN_ARROW && lastTrade?.createdAt > previous10PM) {
                const downArrows = await TradingModel.findOne(
                    {
                        webhookName: { $in: [WEBHOOKS_FOR_SELL.RED_BALL, WEBHOOKS_FOR_SELL.WHITE_ARROW, WEBHOOKS_FOR_SELL.BLUE_ARROW] },
                        createdAt:
                        {
                            $lt: lastTrade.createdAt,
                            $gte: previous10PM

                        }
                    }
                );

                if (!downArrows) await sendEmail(emailPayload);

                break;
            }

            // get previous three signals 
            const lastThreeSignals = await TradingModel.find({ email }).sort({ createdAt: -1 }).limit(3);

            // Check if there's a green arrow in the last three signals
            if (lastThreeSignals?.length && lastThreeSignals.every(signal => signal.webhookName === WEBHOOKS_FOR_BUY.DIAMOND_BUY)) {
                await sendEmail(emailPayload);
                break;
            }

            break;

        case WEBHOOKS_FOR_BUY.DIAMOND_BUY:
            const lastDiamondTrade = await TradingModel.findOne({ email })
                .sort({ createdAt: -1 })
                .exec();

            if (lastDiamondTrade.webhookName === WEBHOOKS_FOR_BUY.DIAMOND_BUY) {
                sendEmail(emailPayload);
                break;
            }

            const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

            // Get down arrows from previous 4 hours
            const downArrows = await TradingModel.findOne(
                {
                    webhookName:
                    {
                        $in: [WEBHOOKS_FOR_SELL.WHITE_ARROW, WEBHOOKS_FOR_SELL.BLUE_ARROW]
                    },
                    createdAt: { $gte: fourHoursAgo }
                }
            );

            // Get Green arrow from previous 4 hours
            const greenArrow = await TradingModel.findOne({ webhookName: WEBHOOKS_FOR_BUY.GREEN_ARROW, createdAt: { $gte: fourHoursAgo } });

            // get any previous signals from green arrow between 10PM and the createdAt time of green arrow
            if (greenArrow) {
                const previousGreenArrowSignal = await TradingModel.findOne({ createdAt: { $lt: greenArrow.createdAt, $gte: previous10PM } });
                if (previousGreenArrowSignal) break
            }

            if (!downArrows && greenArrow && greenArrow.createdAt > previous10PM) await sendEmail({ ...emailPayload, text: `have coinbase buy x ammount of ${ticker}` });

            break;

        case WEBHOOKS_FOR_BUY.GREEN_KEY:
            const lastGKTrade = await TradingModel.findOne({ email }).sort({ createdAt: -1 }).exec();

            if (lastGKTrade.webhookName !== WEBHOOKS_FOR_BUY.DIAMOND_BUY) break;

            const unwantedGKWebhooks = [
                WEBHOOKS_FOR_SELL.RED_BALL,
                WEBHOOKS_FOR_SELL.WHITE_ARROW,
                WEBHOOKS_FOR_SELL.BLUE_ARROW,
            ];

            const unwantedGKWebhookExists = await TradingModel.findOne({
                webhookName: { $in: unwantedGKWebhooks },
                createdAt: { $gte: previous7PM },
            });

            if (lastGKTrade && !unwantedGKWebhookExists) {
                await sendEmail(emailPayload);
            }
            break;

        case WEBHOOKS_FOR_BUY.GREEN_SURF:
            const diamondBuy = await TradingModel.findOne({
                webhookName: WEBHOOKS_FOR_BUY.DIAMOND_BUY,
                createdAt: {
                    $gte: previous7PM
                }
            });

            const unwantedWebhooks = [WEBHOOKS_FOR_SELL.RED_BALL, WEBHOOKS_FOR_SELL.WHITE_ARROW, WEBHOOKS_FOR_SELL.BLUE_ARROW];

            const unwantedWebhookExists = await TradingModel.findOne({
                webhookName: { $in: unwantedWebhooks },
                createdAt: { $gte: previous7PM },
            });

            if (diamondBuy && !unwantedWebhookExists) {
                await sendEmail(emailPayload);
            }

            break;

        default:
            break;
    }

}
export const handleSellSignal = async (trade) => {

    const { webhookName, email, alertType, ticker } = trade;
    const emailPayload = { to: email, subject: alertType, text: `have coinbase sell ${ticker}` };
    const previous10PM = getTradingDayLimit(22); // Get time limit by 10 PM (22:00)

    switch (webhookName) {

        case WEBHOOKS_FOR_SELL.WHITE_ARROW:
        case WEBHOOKS_FOR_SELL.BLUE_ARROW:
        case WEBHOOKS_FOR_SELL.MEORT:
            await sendEmail(emailPayload);
            break;

        case WEBHOOKS_FOR_SELL.RED_BALL:
            await sendEmail({ ...emailPayload, text: `adjust position of ${ticker}` });
            break;

        case WEBHOOKS_FOR_SELL.RED_KEY:

            const redBall = await TradingModel.findOne({
                webhookName: WEBHOOKS_FOR_SELL.RED_BALL,
                createdAt: {
                    $gte: previous10PM
                }
            });

            if (!redBall) break;

            const diamondBuys = await TradingModel.findOne(
                {
                    webhookName: WEBHOOKS_FOR_BUY.DIAMOND_BUY,
                    createdAt:
                    {
                        $gte: previous10PM
                    }
                }
            );

            if (!diamondBuys) await sendEmail(emailPayload);
            break;

        default:
            break;
    }
}

// Will have different logics here for main buy/ green surfer/ greenn key
export const handleSoldSignal = async () => {
    const previous10PM = getTradingDayLimit(22)
    const downWhiteArrows = await TradingModel.findOne(
        {
            webhookName: { $in: [WEBHOOKS_FOR_SELL.WHITE_ARROW] },
            createdAt:
            {
                $gte: previous10PM
            }
        }
    );

    if (!downWhiteArrows) {
        // rebuy logic will go here
    }
}