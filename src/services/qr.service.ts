import QRCode from 'qrcode';

export class QRService {
  static async generate(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text);
    } catch (err) {
      console.error('QR Generation Error:', err);
      throw new Error('Failed to generate QR code');
    }
  }
}
