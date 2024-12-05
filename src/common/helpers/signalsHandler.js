import { WEBHOOKS_FOR_BUY, WEBHOOKS_FOR_SELL } from "../constants.js";
import TradingModel from '../../models/trading.js'
import { sendEmail } from "./sendEmail.js";

function getPrevious10PM(date) {
    // Create a new Date instance to avoid mutating the original
    let result = new Date(date);

    // Check if the time is before 10 PM (22:00)
    if (result.getHours() < 22) {
        // Subtract one day
        result.setDate(result.getDate() - 1);
    }

    // Set the time to 10 PM
    result.setHours(22, 0, 0, 0); // 22:00:00.000

    return result;
}

function getPrevious7PM(date) {
    // Create a new Date instance to avoid mutating the original
    let result = new Date(date);

    // Check if the time is before 7 PM (19:00)
    if (result.getHours() < 19) {
        // Subtract one day
        result.setDate(result.getDate() - 1);
    }

    // Set the time to 7 PM
    result.setHours(19, 0, 0, 0); // 19:00:00.000

    return result;
}

export const handleBuySignal = async (trade) => {

    const { webhookName, email, alertType } = trade;
    const emailPayload = {to: email, subject: alertType, text: 'have coinbase buy' };
    const previous10PM = getPrevious10PM(Date.now());
    const previous7PM = getPrevious7PM(Date.now());

    switch (webhookName) {
        case WEBHOOKS_FOR_BUY.GREEN_ARROW:
            const lastTrade = await TradingModel.findOne({ email })
                .sort({ createdAt: -1 })
                .exec();

            if (lastTrade.webhookName === WEBHOOKS_FOR_BUY.GREEN_ARROW && lastTrade.createdAt > previous10PM) {
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
            if (lastThreeSignals.every(signal => signal.webhookName === WEBHOOKS_FOR_BUY.DIAMOND_BUY)) {
                await sendEmail(emailPayload);
                break;
            }

            break;

        case WEBHOOKS_FOR_BUY.DIAMOND_BUY:

            const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

            if (!(fourHoursAgo > previous10PM)) break;

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

                if (!downArrows && greenArrow) await sendEmail({...emailPayload, text: 'have coinbase buy x ammount' });

            break;

        case WEBHOOKS_FOR_BUY.GREEN_KEY:
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

    const { webhookName, email, alertType } = trade;
    const emailPayload = {to: email, subject: alertType, text: 'have coinbase sell' };
    const previous10PM = getPrevious10PM(Date.now());

    switch (webhookName) {
        case WEBHOOKS_FOR_SELL.WHITE_ARROW:
            await sendEmail(emailPayload);
            break;

        case WEBHOOKS_FOR_SELL.BLUE_ARROW:
            await sendEmail(emailPayload);
            break;

        case WEBHOOKS_FOR_SELL.RED_BALL:
            await sendEmail({...emailPayload, text: 'adjust position' });
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
        case WEBHOOKS_FOR_SELL.MEORT:
            await sendEmail(emailPayload);
            break;

        default:
            break;
    }
}
