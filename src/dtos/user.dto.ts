import { z } from "zod";
import { Branch, Gender, YearOfStudy } from "../generated/prisma/client.js";

export const UserSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Full name too long"),
  registrationNumber: z
    .string()
    .regex(
      /^[a-zA-Z0-9]{10}$/,
      "Registration number must be 10 alphanumeric characters",
    ),
  email: z.string().email("Invalid email address").max(50, "Email too long"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),

  collegeName: z.string().min(1, "College name is required").max(50, "College name too long"),
  yearOfStudy: z.enum(Object.values(YearOfStudy)),
  branch: z.enum(Object.values(Branch)),
  gender: z.enum(Object.values(Gender)),
  isCodingClubAffiliate: z.boolean().default(false),
  affiliateId: z.string().max(10, "Affiliate ID too long").optional(),

  codechefHandle: z.string().max(20, "Handle too long").optional(),
  leetcodeHandle: z.string().max(20, "Handle too long").optional(),
  codeforcesHandle: z.string().max(20, "Handle too long").optional(),

  transactionId: z
    .string()
    .min(8, "Transaction ID too short")
    .max(20, "Transaction ID too long"),
  screenshotUrl: z.string().url("Invalid screenshot URL").max(2048, "URL too long"),

  confirmInfo: z
    .boolean()
    .refine((val) => val === true, "Information must be confirmed")
    .optional(),
});

export type UserInput = z.infer<typeof UserSchema>;
