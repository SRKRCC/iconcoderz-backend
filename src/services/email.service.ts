import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config/index.js';
import { generateRegistrationEmailHTML, type UserData } from '../templates/registration-email.js';
import { generateAttendanceEmailHTML, type AttendanceEmailData } from '../templates/attendance-email.js';

interface EmailQueueItem {
  to: string;
  userData: UserData;
  qrCodeDataUrl: string;
  retries: number;
}

interface AttendanceEmailQueueItem {
  to: string;
  fullName: string;
  retries: number;
}

export class EmailService {
  private static transporter: Transporter | null = null;
  private static emailQueue: EmailQueueItem[] = [];
  private static attendanceQueue: AttendanceEmailQueueItem[] = [];
  private static isProcessing = false;
  private static isProcessingAttendance = false;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000;
  private static readonly EMAIL_DELAY = 1000;

  private static getTransporter(): Transporter {
    if (!this.transporter) {
      if (!config.services.smtp.host || !config.services.smtp.user) {
        throw new Error('SMTP not configured');
      }

      this.transporter = nodemailer.createTransport({
        host: config.services.smtp.host,
        port: 587,
        secure: false,
        auth: {
          user: config.services.smtp.user,
          pass: config.services.smtp.pass,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
      });

      // Handle transporter errors
      this.transporter.on('error', (err) => {
        console.error('[EmailService] Transporter error:', err);
      });
    }

    return this.transporter;
  }

  static async sendConfirmation(
    to: string,
    fullName: string,
    registrationCode: string,
    qrCodeDataUrl: string,
    userData: Partial<UserData>
  ) {
    if (!config.services.smtp.host || !config.services.smtp.user) {
      console.warn('[EmailService] SMTP not configured, skipping email.');
      return;
    }

    const completeUserData: UserData = {
      fullName,
      email: to,
      registrationCode,
      phone: userData.phone || '',
      registrationNumber: userData.registrationNumber || '',
      branch: userData.branch || '',
      yearOfStudy: userData.yearOfStudy || '',
      codechefHandle: userData.codechefHandle,
      leetcodeHandle: userData.leetcodeHandle,
      codeforcesHandle: userData.codeforcesHandle,
    };

    this.emailQueue.push({
      to,
      userData: completeUserData,
      qrCodeDataUrl,
      retries: 0,
    });

    console.log(`[EmailService] Email queued for ${to}. Queue size: ${this.emailQueue.length}`);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private static async processQueue() {
    if (this.isProcessing || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[EmailService] Starting queue processing. ${this.emailQueue.length} emails in queue.`);

    while (this.emailQueue.length > 0) {
      const item = this.emailQueue[0];

      try {
        await this.sendEmail(item);
        this.emailQueue.shift();
        console.log(`[EmailService] Email sent successfully to ${item.to}. Remaining: ${this.emailQueue.length}`);

        if (this.emailQueue.length > 0) {
          await this.delay(this.EMAIL_DELAY);
        }
      } catch (error) {
        console.error(`[EmailService] Failed to send email to ${item.to}:`, error);

        item.retries++;
        if (item.retries >= this.MAX_RETRIES) {
          console.error(`[EmailService] Max retries reached for ${item.to}. Removing from queue.`);
          this.emailQueue.shift();
        } else {
          this.emailQueue.shift();
          this.emailQueue.push(item);
          console.log(`[EmailService] Retry ${item.retries}/${this.MAX_RETRIES} for ${item.to}. Moving to end of queue.`);
          await this.delay(this.RETRY_DELAY);
        }
      }
    }

    this.isProcessing = false;
    console.log('[EmailService] Queue processing completed.');
  }

  private static async sendEmail(item: EmailQueueItem): Promise<void> {
    const transporter = this.getTransporter();
    const htmlContent = generateRegistrationEmailHTML(item.userData);

    const info = await transporter.sendMail({
      from: {
        name: 'IconCoderz 2K26',
        address: config.services.smtp.user,
      },
      to: item.to,
      subject: '🎉 Registration Confirmed - IconCoderz 2K26 | SRKR Coding Club',
      html: htmlContent,
      attachments: [
        {
          filename: `iconcoderz-qr-${item.userData.registrationCode}.png`,
          path: item.qrCodeDataUrl,
          cid: 'qrcode',
        },
      ],
    });

    console.log('[EmailService] Message sent: %s to %s', info.messageId, item.to);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async sendAttendanceConfirmation(to: string, fullName: string) {
    if (!config.services.smtp.host || !config.services.smtp.user) {
      console.warn('[EmailService] SMTP not configured, skipping attendance email.');
      return;
    }

    this.attendanceQueue.push({
      to,
      fullName,
      retries: 0,
    });

    console.log(`[EmailService] Attendance email queued for ${to}. Queue size: ${this.attendanceQueue.length}`);

    if (!this.isProcessingAttendance) {
      this.processAttendanceQueue();
    }
  }

  private static async processAttendanceQueue() {
    if (this.isProcessingAttendance || this.attendanceQueue.length === 0) {
      return;
    }

    this.isProcessingAttendance = true;
    console.log(`[EmailService] Starting attendance queue processing. ${this.attendanceQueue.length} emails in queue.`);

    while (this.attendanceQueue.length > 0) {
      const item = this.attendanceQueue[0];

      try {
        await this.sendAttendanceEmail(item);
        this.attendanceQueue.shift();
        console.log(`[EmailService] Attendance email sent successfully to ${item.to}. Remaining: ${this.attendanceQueue.length}`);

        if (this.attendanceQueue.length > 0) {
          await this.delay(this.EMAIL_DELAY);
        }
      } catch (error) {
        console.error(`[EmailService] Failed to send attendance email to ${item.to}:`, error);

        item.retries++;
        if (item.retries >= this.MAX_RETRIES) {
          console.error(`[EmailService] Max retries reached for ${item.to}. Removing from queue.`);
          this.attendanceQueue.shift();
        } else {
          this.attendanceQueue.shift();
          this.attendanceQueue.push(item);
          console.log(`[EmailService] Retry ${item.retries}/${this.MAX_RETRIES} for ${item.to}. Moving to end of queue.`);
          await this.delay(this.RETRY_DELAY);
        }
      }
    }

    this.isProcessingAttendance = false;
    console.log('[EmailService] Attendance queue processing completed.');
  }

  private static async sendAttendanceEmail(item: AttendanceEmailQueueItem): Promise<void> {
    const transporter = this.getTransporter();
    const userData: AttendanceEmailData = {
      fullName: item.fullName,
      email: item.to,
    };
    const htmlContent = generateAttendanceEmailHTML(userData);

    const info = await transporter.sendMail({
      from: {
        name: 'IconCoderz 2K26',
        address: config.services.smtp.user,
      },
      to: item.to,
      subject: '🎉 Welcome to IconCoderz 2K26! Thanks for Attending',
      html: htmlContent,
    });

    console.log('[EmailService] Attendance email sent: %s to %s', info.messageId, item.to);
  }

  // Graceful shutdown
  static async close() {
    if (this.transporter) {
      await this.transporter.close();
      this.transporter = null;
      console.log('[EmailService] Transporter closed.');
    }
  }
}
