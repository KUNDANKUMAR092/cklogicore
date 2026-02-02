// fieldsConfig.js
export const supplierFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "business.gstNumber", label: "GST Number", type: "text" },
  { name: "business.panNumber", label: "PAN Number", type: "text" },
  { name: "bank.bankName", label: "Bank Name", type: "text" },
  { name: "credit.creditLimit", label: "Credit Limit", type: "number" }
];

export const companyFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "address", label: "Address", type: "text" },
  { name: "business.gstNumber", label: "GST Number", type: "text" },
  { name: "business.panNumber", label: "PAN Number", type: "text" },
  { name: "billing.paymentTerms", label: "Payment Terms", type: "text" },
  { name: "billing.creditLimit", label: "Credit Limit", type: "number" }
];

export const vehicleFields = [
  { name: "vehicleNumber", label: "Vehicle Number", type: "text", required: true },
  { name: "capacity", label: "Capacity", type: "text" },
  { name: "owner.name", label: "Owner Name", type: "text" },
  { name: "owner.mobile", label: "Owner Mobile", type: "text" },
  { name: "driver.name", label: "Driver Name", type: "text" },
  { name: "driver.phone", label: "Driver Phone", type: "text" },
  { name: "documents.rcExpiry", label: "RC Expiry", type: "date" },
  { name: "documents.insuranceExpiry", label: "Insurance Expiry", type: "date" },
  { name: "documents.permitExpiry", label: "Permit Expiry", type: "date" }
];

export const getTripFields = (accountType, currentId) => [
  // Entity Links with Conditional Disable
  { 
    name: "supplierId", 
    label: "Supplier", 
    type: "select", 
    required: true,
    disabled: accountType === "supplier",
    defaultValue: accountType === "supplier" ? currentId : "" 
  },
  { 
    name: "companyId", 
    label: "Company", 
    type: "select", 
    required: true,
    disabled: accountType === "company",
    defaultValue: accountType === "company" ? currentId : "" 
  },
  { 
    name: "vehicleId", 
    label: "Vehicle", 
    type: "select", 
    required: true,
    disabled: accountType === "vehicle",
    defaultValue: accountType === "vehicle" ? currentId : "" 
  },

  // Trip Details
  { name: "tripDate", label: "Trip Date", type: "date", required: true },
  { name: "loadingPoint", label: "Loading Point", type: "text", required: true },
  { name: "unloadingPoint", label: "Unloading Point", type: "text", required: true },
  { name: "totalTonLoad", label: "Total Ton Load", type: "number", required: true },

  // Input Rates
  { 
    name: "rates.companyRatePerTon", 
    label: "Company Rate/Ton", 
    type: "number", 
    // Agar accountType 'company' hai toh hide/optional kardo
    required: accountType !== "company",
    hidden: accountType === "company" 
  },
  { 
    name: "rates.vehicleRatePerTon", 
    label: "Vehicle Rate/Ton", 
    type: "number", 
    // Agar accountType 'vehicle_owner' hai toh hide/optional kardo
    required: accountType !== "vehicle",
    hidden: accountType === "vehicle"
  },
  { 
    name: "rates.supplierRatePerTon", 
    label: "Supplier Rate/Ton", 
    type: "number", 
    // Agar accountType 'supplier' hai toh hide/optional kardo
    required: accountType !== "supplier",
    hidden: accountType === "supplier"
  },

  // Financials (Expenses)
  { name: "financials.advancePaid", label: "Advance Paid", type: "number" },
  { name: "financials.dieselCost", label: "Diesel Cost", type: "number" },
  { name: "financials.tollCost", label: "Toll Cost", type: "number" },
  { name: "financials.driverExpense", label: "Driver Expense", type: "number" },
  { name: "financials.otherExpense", label: "Other Expense", type: "number" },

  // 💰 Auto-Calculated Fields (Hamesha Disable rahenge)
  { name: "totalFinancials.totalAmountForCompany", label: "Total Company Pay", type: "number", disabled: true },
  { name: "totalFinancials.totalAmountForVehicle", label: "Total Vehicle Pay", type: "number", disabled: true },
  { name: "totalFinancials.totalAmountForSupplier", label: "Total Supplier Pay", type: "number", disabled: true },
  { name: "totalFinancials.profitPerTrip", label: "Expected Profit", type: "number", disabled: true },

  { 
    name: "challans", 
    label: "Upload Challans", 
    type: "file",
    multiple: true,
    accept: "image/*,application/pdf",
    required: false 
  },

  { 
    name: "status", 
    label: "Status", 
    type: "select", 
    options: [
      { label: "Pending", value: "pending" },
      { label: "Running", value: "running" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ]
  },
];

export const userFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "text", required: true },
  { name: "password", label: "Password", type: "password", required: true },
  { name: "role", label: "Role", type: "select", options: [
      { label: "Admin", value: "admin" },
      { label: "Staff", value: "staff" }
    ]
  },
  { name: "accountType", label: "Account Type", type: "select", options: [
      { label: "Supplier", value: "supplier" },
      { label: "Company", value: "company" },
      { label: "Vehicle", value: "vehicle" }
    ]
  },
];

