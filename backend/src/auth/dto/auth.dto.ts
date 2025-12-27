
import { z } from 'zod';

// Strong Password Regex: 12+ chars, uppercase, lowercase, number, symbol
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const RegisterSchema = z.object({
  email: z.string().email().trim().toLowerCase().max(255),
  password: z.string().regex(passwordRegex, {
    message: 'Password must be 12+ chars, include uppercase, lowercase, number, and symbol',
  }),
  firstName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]*$/),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]*$/),
});

export const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().max(100),
  totpCode: z.string().length(6).optional(), // For 2FA
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;