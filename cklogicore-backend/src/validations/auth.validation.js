import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    // 🆕 Mobile field yahan add karni hai
    mobile: z.string()
      .length(10, "Mobile number must be exactly 10 digits")
      .regex(/^[0-9]+$/, "Mobile number must contain only digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    accountType: z.enum(["SUPPLIER", "COMPANY", "VEHICLE"]).optional()
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