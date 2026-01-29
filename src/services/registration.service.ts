import { prisma } from "../utils/prisma.js";
import { UserInput } from "../dtos/user.dto.js";
import { v4 as uuidv4 } from "uuid";
import { QRService } from "./qr.service.js";
import { EmailService } from "./email.service.js";
import { AuditService } from "./audit.service.js";

export class RegistrationService {
  static async register(data: UserInput) {
    // Log start of registration
    await AuditService.create("REGISTRATION_STARTED", {
      email: data.email,
      registrationNumber: data.registrationNumber,
      phone: data.phone,
    });

    console.log("[RegistrationService] Starting registration for", data);

    try {
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
        if (existing.email === data.email)
          throw new Error("Email already registered");
        if (existing.registrationNumber === data.registrationNumber)
          throw new Error("Registration number already registered");
        if (existing.phone === data.phone)
          throw new Error("Phone number already registered");
        if (existing.transactionId === data.transactionId)
          throw new Error("Transaction ID already used");
      }

      const uniqueSuffix = uuidv4().split("-")[0].toUpperCase();
      const registrationCode = `IC2K26-${uniqueSuffix}`;

      const user = await prisma.user.create({
        data: {
          registrationCode,
          fullName: data.fullName,
          registrationNumber: data.registrationNumber,
          email: data.email,
          phone: data.phone,
          collegeName: data.collegeName,
          yearOfStudy: data.yearOfStudy,
          branch: data.branch,
          gender: data.gender,
          isCodingClubAffiliate: data.isCodingClubAffiliate,
          affiliateId: data.affiliateId,
          codechefHandle: data.codechefHandle,
          leetcodeHandle: data.leetcodeHandle,
          codeforcesHandle: data.codeforcesHandle,
          transactionId: data.transactionId,
          screenshotUrl: data.screenshotUrl,
          paymentStatus: "PENDING",
        },
      });

      console.log("[RegistrationService] resgistered user", user);

      const qrCode = await QRService.generate(user.registrationCode, user.id);

      try {
        await EmailService.sendConfirmation(
          user.email,
          user.fullName,
          registrationCode,
          qrCode,
          {
            phone: user.phone,
            registrationNumber: user.registrationNumber,
            branch: user.branch,
            yearOfStudy: user.yearOfStudy,
            codechefHandle: user.codechefHandle,
            leetcodeHandle: user.leetcodeHandle,
            codeforcesHandle: user.codeforcesHandle,
          },
        );
      } catch (err) {
        console.error("[RegistrationService] Failed to send confirmation email", err);
        // Don't fail registration due to email issues
      }

      // Log success
      await AuditService.create(
        "REGISTRATION_SUCCESS",
        {
          userId: user.id,
          registrationCode: user.registrationCode,
          email: user.email,
        },
        user.id,
      );

      return user;
    } catch (err) {
      // Log failure for investigation
      console.error("[RegistrationService] Registration failed", err);
      await AuditService.create("REGISTRATION_FAILED", {
        error: (err as Error).message || err,
        input: {
          email: data.email,
          registrationNumber: data.registrationNumber,
          phone: data.phone,
        },
      });

      throw err;
    }
  }
}
