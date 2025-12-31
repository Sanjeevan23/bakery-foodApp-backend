/* Create a Roles enum so we don’t hardcode strings everywhere. */

// src/auth/common/roles.enum.ts
export enum Role {
  ADMIN = 'admin',
  CASHIER = 'cashier',
  DELIVERY = 'delivery',
  CUSTOMER = 'customer',
}
