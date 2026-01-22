import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminLoginInput } from '../dtos/admin.dto.js';
import { config } from '../config/index.js';

export class AdminService {
  static async login(data: AdminLoginInput) {
    const admin = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, admin.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        role: 'admin' 
      },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async getAllUsers(filters?: {
    paymentStatus?: string;
    branch?: string;
    yearOfStudy?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters?.branch) {
      where.branch = filters.branch;
    }

    if (filters?.yearOfStudy) {
      where.yearOfStudy = filters.yearOfStudy;
    }

    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { registrationNumber: { contains: filters.search, mode: 'insensitive' } },
        { registrationCode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async updatePaymentStatus(
    userId: string,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { paymentStatus: status },
    });

    return user;
  }

  static async getDashboardStats() {
    const [
      totalParticipants,
      verifiedPayments,
      pendingPayments,
      rejectedPayments,
      branchDistribution,
      yearDistribution,
      recentRegistrations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { paymentStatus: 'VERIFIED' } }),
      prisma.user.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.user.count({ where: { paymentStatus: 'REJECTED' } }),
      prisma.user.groupBy({
        by: ['branch'],
        _count: { branch: true },
      }),
      prisma.user.groupBy({
        by: ['yearOfStudy'],
        _count: { yearOfStudy: true },
      }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          registrationCode: true,
          fullName: true,
          branch: true,
          yearOfStudy: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalParticipants,
      verifiedPayments,
      pendingPayments,
      rejectedPayments,
      branchDistribution: branchDistribution.reduce((acc, item) => {
        acc[item.branch] = item._count.branch;
        return acc;
      }, {} as Record<string, number>),
      yearDistribution: yearDistribution.reduce((acc, item) => {
        acc[item.yearOfStudy] = item._count.yearOfStudy;
        return acc;
      }, {} as Record<string, number>),
      recentRegistrations,
    };
  }
}
