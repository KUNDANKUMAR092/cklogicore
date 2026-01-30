import { ROLES } from "./roles.js";
import { ACCOUNT_TYPES } from "./accountTypes.js";
import { PERMISSIONS } from "./permissions.js";

export const RBAC = {
  [ROLES.ADMIN]: {
    accountTypes: Object.values(ACCOUNT_TYPES), // all
    permissions: Object.values(PERMISSIONS), // all
  },

  [ROLES.STAFF]: {
    accountTypes: [
      ACCOUNT_TYPES.SUPPLIER,
      ACCOUNT_TYPES.COMPANY,
    ],
    permissions: [
      PERMISSIONS.TRIP_CREATE,
      PERMISSIONS.TRIP_VIEW,
      PERMISSIONS.TRIP_EDIT,
      PERMISSIONS.ADVANCE_ADD,
      PERMISSIONS.EXCEL_EXPORT,
      PERMISSIONS.VIEW_OWN_PROFILE,
    ],
  },
};
