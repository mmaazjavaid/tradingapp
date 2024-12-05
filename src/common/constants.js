export const WEBHOOKS_FOR_BUY = {
	GREEN_ARROW: 'green arrow',
	DIAMOND_BUY: 'diamond buy',
	GREEN_KEY: 'green key',
	GREEN_SURF: 'green surf',
};

export const WEBHOOKS_FOR_SELL = {
	WHITE_ARROW: 'white arrow',
	BLUE_ARROW: 'blue arrow',
	RED_BALL: 'red ball',
	RED_KEY: 'red key',
	MEORT: 'meort',
};

export const TRADDING_TYPES = {
	BUY: 'buy',
	SELL: 'sell',
};

export const EMAIL_TEMPLET = `
<html>
<head>
</head>
<body>
<p>
Dear {email}<br><br>
Kindly {tradeMsg}
</p>
</body>
</html>
`;
