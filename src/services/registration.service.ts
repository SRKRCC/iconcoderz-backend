import { prisma } from "../utils/prisma.js";
import { UserInput } from "../dtos/user.dto.js";
import { v4 as uuidv4 } from "uuid";
import { AuditService } from "./audit.service.js";
import { Prisma } from "../generated/prisma/client.js";

export class RegistrationService {
  static async register(data: UserInput) {

    await AuditService.create("REGISTRATION_STARTED", {
      email: data.email,
      registrationNumber: data.registrationNumber,
      phone: data.phone,
    });

    console.log("[RegistrationService] Starting registration for", data);

    try {
      const [byEmail, byReg, byPhone, byTxn] = await Promise.all([
        prisma.user.findUnique({ where: { email: data.email } }),
        prisma.user.findUnique({ where: { registrationNumber: data.registrationNumber } }),
        prisma.user.findUnique({ where: { phone: data.phone } }),
        prisma.user.findUnique({ where: { transactionId: data.transactionId } }),
      ]);

      if (byEmail) throw new Error("Email already registered");
      if (byReg) throw new Error("Registration number already registered");
      if (byPhone) throw new Error("Phone number already registered");
      if (byTxn) throw new Error("Transaction ID already used");

      const uniqueSuffix = uuidv4().split("-")[0].toUpperCase();
      const registrationCode = `IC2K26-${uniqueSuffix}`;

      let user;
      try {
        user = await prisma.$transaction(async (tx) => {
          const created = await tx.user.create({
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

          const payload = {
            action: "send_confirmation",
            userId: created.id,
            email: created.email,
            fullName: created.fullName,
            registrationCode: created.registrationCode,
            phone: created.phone,
            registrationNumber: created.registrationNumber,
            branch: created.branch,
            yearOfStudy: created.yearOfStudy,
            codechefHandle: created.codechefHandle,
            leetcodeHandle: created.leetcodeHandle,
            codeforcesHandle: created.codeforcesHandle,
          };

          await tx.outbox.create({
            data: {
              aggregate: "user",
              aggregateId: created.id,
              type: "send_confirmation",
              payload,
            },
          });

          return created;
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          const target = Array.isArray(err.meta?.target) ? (err.meta!.target as string[])[0] : (err.meta?.target as string) ?? "field";
          switch (target) {
            case "email":
              throw new Error("Email already registered");
            case "registrationNumber":
              throw new Error("Registration number already registered");
            case "phone":
              throw new Error("Phone number already registered");
            case "transactionId":
              throw new Error("Transaction ID already used");
            default:
              throw new Error("Unique constraint violation");
          }
        }
        throw err;
      }

      console.log("[RegistrationService] resgistered user", user);

      AuditService.create("REGISTRATION_SUCCESS", { registrationCode: user.registrationCode, email: user.email })
        .catch(err => console.error("[RegistrationService] Audit failed (background)", err));


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
