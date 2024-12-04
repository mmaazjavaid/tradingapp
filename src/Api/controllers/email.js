export const sendEmail = async (req, res, next) => {
    try {
        const { webhookName, alertType } = req.body;

        if (alertType === 'buy') {
            // handle buy signal
            await handleBuySignal(webhookName, alertType);

        } else {
            // handle sell signal
            await handleSellSignal(webhookName, alertType);
        }
        return res.status(200).send('Email sent successfully');
    } catch (e) {
        return next(e);
    }
};
