import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export class EmailService {
  static async sendConfirmation(to: string, name: string, registrationCode: string, qrCodeDataUrl: string) {
    if (!config.services.smtp.host || !config.services.smtp.user) {
      console.warn('[EmailService] SMTP not configured, skipping email.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: config.services.smtp.host,
      port: 587,
      secure: false,
      auth: {
        user: config.services.smtp.user,
        pass: config.services.smtp.pass,
      },
    });

    console.log(`[EmailService] Sending confirmation to ${to} (${name}) with code ${registrationCode}`);
    
    try {
        const info = await transporter.sendMail({
        from: '"IconCoderz" <no-reply@iconcoderz.srkrcodingclub.in>',
        to,
        subject: 'Registration Confirmed - IconCoderz 2K26',
        html: `
            <h1>Welcome to IconCoderz 2K26!</h1>
            <p>Hi ${name},</p>
            <p>Your registration is confirmed. Your ID is <strong>${registrationCode}</strong>.</p>
            <p>Please present the attached QR code at the event entrance.</p>
            <br/>
            <img src="cid:qrcode" alt="QR Code" width="200"/>
        `,
        attachments: [
            {
            filename: 'qrcode.png',
            path: qrCodeDataUrl,
            cid: 'qrcode',
            },
        ],
        });

        console.log('[EmailService] Message sent: %s', info.messageId);
    } catch (err) {
        console.error('[EmailService] Failed to send email:', err);
    }
  }
}
