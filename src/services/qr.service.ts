import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../config/index.js';

interface QRPayload {
  registrationCode: string;
  userId: string;
  eventId: string;
  generatedAt: string;
  verificationHash: string;
}

export class QRService {
  private static readonly EVENT_ID = 'iconcoderz-2k26';
  private static get SECRET_KEY(): string {
    return config.qr.secretKey;
  }

  static generateVerificationHash(registrationCode: string, userId: string, generatedAt: string): string {
    const data = `${registrationCode}:${userId}:${this.EVENT_ID}:${generatedAt}:${this.SECRET_KEY}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static verifyHash(payload: QRPayload): boolean {
    const expectedHash = this.generateVerificationHash(
      payload.registrationCode,
      payload.userId,
      payload.generatedAt
    );
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash),
      Buffer.from(payload.verificationHash)
    );
  }

  static async generate(registrationCode: string, userId: string): Promise<string> {
    try {
      const generatedAt = new Date().toISOString();
      const verificationHash = this.generateVerificationHash(registrationCode, userId, generatedAt);

      const payload: QRPayload = {
        registrationCode,
        userId,
        eventId: this.EVENT_ID,
        generatedAt,
        verificationHash,
      };

      const qrData = JSON.stringify(payload);
      return await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('QR Generation Error:', err);
      throw new Error('Failed to generate QR code');
    }
  }
}
