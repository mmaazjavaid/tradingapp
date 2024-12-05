import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { EMAIL_TEMPLET } from '../constants.js';

dotenv.config();

const { SENDGRID_API_KEY } = process.env;

// Set the API key
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send an email using SendGrid.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Plain text content.
 * @param {string} html - HTML content (optional).
 */

export const sendEmail = async ({ to, subject, text, html = '' }) => {
	const msg = {
		to,
		from: process.env.SENDER_EMAIL, // Must be a verified sender in SendGrid
		subject,
		text,
		html,
	};

	msg.html = EMAIL_TEMPLET.replace('{email}', to)?.replace('{tradeMsg}', text);

	try {
		const response = await sgMail.send(msg);
		console.log('Email sent successfully:', response[0].statusCode);
	} catch (error) {
		console.error('Error sending email:', error.message);
	}
};
