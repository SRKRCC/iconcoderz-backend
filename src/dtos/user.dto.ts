import { z } from 'zod';
import { Branch, Gender, YearOfStudy } from '../generated/prisma/client.js';

export const UserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  registrationNumber: z.string().regex(/^\d{12}$/, 'Registration number must be 12 digits'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  
  yearOfStudy: z.enum(Object.values(YearOfStudy)),
  branch: z.enum(Object.values(Branch)),
  gender: z.enum(Object.values(Gender)),
  
  codechefHandle: z.string().optional(),
  leetcodeHandle: z.string().optional(),
  codeforcesHandle: z.string().optional(),
  
  transactionId: z.string().min(8, 'Transaction ID too short').max(20, 'Transaction ID too long'),
  screenshotUrl: z.string().url('Invalid screenshot URL'),
  
  confirmInfo: z.boolean().refine(val => val === true, 'Information must be confirmed').optional(),
});

export type UserInput = z.infer<typeof UserSchema>;
