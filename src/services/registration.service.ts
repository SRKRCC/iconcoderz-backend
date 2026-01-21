import { prisma } from '../utils/prisma.js';
import { UserInput } from '../dtos/user.dto.js';
import { v4 as uuidv4 } from 'uuid';
import { QRService } from './qr.service.js';
import { EmailService } from './email.service.js';

export class RegistrationService {
  static async register(data: UserInput) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { registrationNumber: data.registrationNumber },
          { phone: data.phone },
          { transactionId: data.transactionId },
        ],
      },
    });

    if (existing) {
      if (existing.email === data.email) throw new Error('Email already registered');
      if (existing.registrationNumber === data.registrationNumber) throw new Error('Registration number already registered');
      if (existing.phone === data.phone) throw new Error('Phone number already registered');
      if (existing.transactionId === data.transactionId) throw new Error('Transaction ID already used');
    }

    const uniqueSuffix = uuidv4().split('-')[0].toUpperCase();
    const registrationCode = `IC2K26-${uniqueSuffix}`;

    const user = await prisma.user.create({
      data: {
        registrationCode,
        fullName: data.fullName,
        registrationNumber: data.registrationNumber,
        email: data.email,
        phone: data.phone,
        yearOfStudy: data.yearOfStudy,
        branch: data.branch,
        gender: data.gender,
        codechefHandle: data.codechefHandle,
        leetcodeHandle: data.leetcodeHandle,
        codeforcesHandle: data.codeforcesHandle,
        transactionId: data.transactionId,
        screenshotUrl: data.screenshotUrl,
        paymentStatus: 'PENDING',
      },
    });

    const qrCode = await QRService.generate(user.registrationCode);

    EmailService.sendConfirmation(user.email, user.fullName, registrationCode, qrCode)
      .catch(err => console.error('Failed to send confirmation email', err));

    return user;
  }
}
