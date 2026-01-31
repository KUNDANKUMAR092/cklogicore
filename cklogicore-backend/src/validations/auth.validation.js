import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    accountType: z.enum(["FREE", "PRO", "ENTERPRISE"]).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, "New password must be at least 8 characters")
  })
});