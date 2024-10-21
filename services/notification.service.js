import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import {logger} from "../logs/logger.js"

class NotificationService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    async sendEmail(to, subject, text) {
        const msg = {
            to,
            from: process.env.EMAIL_FROM || 'noreply@TMS.com', // your verified sender
            subject,
            text,
        };
        logger.info(`sending email to: ${to}`)
        await sgMail.send(msg);
    }

    async sendSMS(to, body) {
        await this.twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${to}`,
        });
    }
}

const notificationService = new NotificationService();
export default notificationService;
