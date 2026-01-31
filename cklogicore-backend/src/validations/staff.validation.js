import { z } from "zod";

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be 8+ characters"),
    permissions: z.object({
      ADD_SUPPLIER: z.boolean().default(false),
      ADD_COMPANY: z.boolean().default(false),
      ADD_VEHICLE: z.boolean().default(false),
      VIEW_REPORTS: z.boolean().default(false),
    }).optional()
  })
});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    permissions: z.object({
      ADD_SUPPLIER: z.boolean().optional(),
      ADD_COMPANY: z.boolean().optional(),
      ADD_VEHICLE: z.boolean().optional(),
      VIEW_REPORTS: z.boolean().optional(),
    }).optional(),
    isActive: z.boolean().optional()
  })
});