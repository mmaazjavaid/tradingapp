import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import routes from './src/Api/routes/index.js';
import connectDB from './src/config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
connectDB();

// Routes
app.use('/api', routes);

// If not in a serverless environment, start the server
if (process.env.NODE_ENV !== 'PROD') {
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

// Export the app for serverless
export default app;
