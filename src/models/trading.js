import mongoose from 'mongoose';

const tradingSchema = new mongoose.Schema({
	exchange: {
		type: String,
		required: true,
	},
	ticker: {
		type: String,
		required: true,
	},
	webhookName: {
		type: String,
		required: true,
	},
	time: {
		type: Date,
		required: true,
	},
	alertType: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	email:{
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	LastUpdatedAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model('trading', tradingSchema);
