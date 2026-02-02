import { z } from "zod";

// Shared logic for base fields
const tripBase = {
  supplierId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Supplier ID"),
  companyId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Company ID"),
  vehicleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Vehicle ID"),
  
  // Date handling
  tripDate: z.preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), z.date()),
  
  loadingPoint: z.string().min(1, "Loading Point is required"),
  unloadingPoint: z.string().min(1, "Unloading Point is required"),
  totalTonLoad: z.coerce.number().positive("Total Ton Load must be positive"),

  // Rates handling (Zod will group rates[key] into this object)
  rates: z.object({
    companyRatePerTon: z.coerce.number().nonnegative().default(0),
    vehicleRatePerTon: z.coerce.number().nonnegative().default(0),
    supplierRatePerTon: z.coerce.number().nonnegative().default(0),
  }).default({}), // Default empty object if not provided

  // Financials handling
  financials: z.object({
    advancePaid: z.coerce.number().nonnegative().default(0),
    dieselCost: z.coerce.number().nonnegative().default(0),
    tollCost: z.coerce.number().nonnegative().default(0),
    driverExpense: z.coerce.number().nonnegative().default(0),
    otherExpense: z.coerce.number().nonnegative().default(0),
  }).optional().default({}),

  status: z.enum(["pending", "running", "completed", "cancelled"]).default("pending"),
  tripId: z.string().optional(),
};

// Create Schema
export const createTripSchema = z.object({
  body: z.object(tripBase) // .strict() hata rahe hain temporarily for debugging
});

// Update Schema
export const updateTripSchema = z.object({
  body: z.object(tripBase).partial()
});