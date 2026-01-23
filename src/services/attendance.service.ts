import { prisma } from '../utils/prisma.js';
import { QRService } from './qr.service.js';
import { ManualCheckInInput } from '../dtos/attendance.dto.js';
import { cache, CacheKeys, CacheTTL } from '../utils/cache.js';

interface QRPayload {
  registrationCode: string;
  userId: string;
  eventId: string;
  generatedAt: string;
  verificationHash: string;
}

export class AttendanceService {
  static async scanQR(qrData: string, adminId: string, ipAddress?: string, deviceInfo?: string) {
    let payload: QRPayload;

    try {
      payload = JSON.parse(qrData);
    } catch {
      throw new Error('Invalid QR code format');
    }

    // Verify QR signature
    if (!QRService.verifyHash(payload)) {
      throw new Error('QR code verification failed. This QR may be tampered or fake.');
    }

    // Verify event ID
    if (payload.eventId !== 'iconcoderz-2k26') {
      throw new Error('This QR code is not for IconCoderz-2K26 event');
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        registrationCode: payload.registrationCode,
        id: payload.userId,
      },
    });

    if (!user) {
      throw new Error('Registration not found. Invalid QR code.');
    }

    // Check payment status
    if (user.paymentStatus !== 'VERIFIED') {
      throw new Error('Payment not verified. Please contact admin.');
    }

    // Check if already attended
    if (user.attended) {
      return {
        success: false,
        alreadyAttended: true,
        message: 'Already checked in',
        user: {
          fullName: user.fullName,
          registrationCode: user.registrationCode,
          email: user.email,
          attendedAt: user.attendedAt,
        },
      };
    }

    // Mark attendance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        attended: true,
        attendedAt: new Date(),
        attendedBy: adminId,
        checkInCount: { increment: 1 },
      },
    });

    // Create attendance log
    await prisma.attendanceLog.create({
      data: {
        registrationId: user.id,
        adminId,
        ipAddress,
        deviceInfo,
      },
    });

    return {
      success: true,
      alreadyAttended: false,
      message: 'Check-in successful',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        registrationCode: updatedUser.registrationCode,
        email: updatedUser.email,
        phone: updatedUser.phone,
        branch: updatedUser.branch,
        yearOfStudy: updatedUser.yearOfStudy,
        attendedAt: updatedUser.attendedAt,
      },
    };
  }

  static async manualCheckIn(data: ManualCheckInInput, adminId: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          data.registrationCode ? { registrationCode: data.registrationCode } : undefined,
          data.email ? { email: data.email } : undefined,
          data.phone ? { phone: data.phone } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.paymentStatus !== 'VERIFIED') {
      throw new Error('Payment not verified');
    }

    if (user.attended) {
      return {
        success: false,
        alreadyAttended: true,
        message: 'Already checked in',
        user: {
          fullName: user.fullName,
          registrationCode: user.registrationCode,
          attendedAt: user.attendedAt,
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        attended: true,
        attendedAt: new Date(),
        attendedBy: adminId,
        checkInCount: { increment: 1 },
      },
    });

    await prisma.attendanceLog.create({
      data: {
        registrationId: user.id,
        adminId,
      },
    });

    return {
      success: true,
      alreadyAttended: false,
      message: 'Manual check-in successful',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        registrationCode: updatedUser.registrationCode,
        email: updatedUser.email,
        phone: updatedUser.phone,
        branch: updatedUser.branch,
        yearOfStudy: updatedUser.yearOfStudy,
        attendedAt: updatedUser.attendedAt,
      },
    };
  }

  static async getStats() {
    return cache.getOrCompute(
      CacheKeys.ATTENDANCE_STATS,
      CacheTTL.ATTENDANCE_STATS,
      async () => {
        const [total, attended, verified] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { attended: true } }),
          prisma.user.count({ where: { paymentStatus: 'VERIFIED' } }),
        ]);

        const pending = verified - attended;
        const attendanceRate = verified > 0 ? Math.round((attended / verified) * 100) : 0;

        return {
          total,
          verified,
          attended,
          pending,
          attendanceRate,
        };
      }
    );
  }

  static async getRecentScans(limit: number = 10) {
    const logs = await prisma.attendanceLog.findMany({
      take: limit,
      orderBy: { scannedAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            registrationCode: true,
            email: true,
            branch: true,
          },
        },
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return logs;
  }

  static async getAttendanceList(params: {
    page: number;
    limit: number;
    search?: string;
    attended?: 'true' | 'false' | 'all';
    sortBy?: 'createdAt' | 'attendedAt' | 'fullName';
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search, attended, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: any = { paymentStatus: 'VERIFIED' };

    if (attended !== 'all') {
      where.attended = attended === 'true';
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { registrationCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          fullName: true,
          registrationCode: true,
          email: true,
          phone: true,
          branch: true,
          yearOfStudy: true,
          attended: true,
          attendedAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
