export type StaffRole = 'super_admin' | 'order_manager' | 'customer_support' | 'content_manager';

export interface AdminPermissions {
  viewDashboard: boolean;
  viewOrders: boolean;
  manageOrders: boolean;
  viewInquiries: boolean;
  replyInquiries: boolean;
  viewContacts: boolean;
  manageContacts: boolean;
  manageProducts: boolean;
  manageCategories: boolean;
  manageCreations: boolean;
  manageSettings: boolean;
  manageStaff: boolean;
  viewAuditLogs: boolean;
}

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role: StaffRole;
  active: boolean;
  permissions: AdminPermissions;
  lastLogin?: any;
  createdAt?: any;
  updatedAt?: any;
}

export const SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  viewDashboard: true,
  viewOrders: true,
  manageOrders: true,
  viewInquiries: true,
  replyInquiries: true,
  viewContacts: true,
  manageContacts: true,
  manageProducts: true,
  manageCategories: true,
  manageCreations: true,
  manageSettings: true,
  manageStaff: true,
  viewAuditLogs: true,
};

export const ORDER_MANAGER_PERMISSIONS: AdminPermissions = {
  viewDashboard: true,
  viewOrders: true,
  manageOrders: true,
  viewInquiries: true,
  replyInquiries: true,
  viewContacts: false,
  manageContacts: false,
  manageProducts: false,
  manageCategories: false,
  manageCreations: false,
  manageSettings: false,
  manageStaff: false,
  viewAuditLogs: false,
};

export const CUSTOMER_SUPPORT_PERMISSIONS: AdminPermissions = {
  viewDashboard: true,
  viewOrders: true,
  manageOrders: false,
  viewInquiries: true,
  replyInquiries: true,
  viewContacts: true,
  manageContacts: true,
  manageProducts: false,
  manageCategories: false,
  manageCreations: false,
  manageSettings: false,
  manageStaff: false,
  viewAuditLogs: false,
};

export const CONTENT_MANAGER_PERMISSIONS: AdminPermissions = {
  viewDashboard: true,
  viewOrders: false,
  manageOrders: false,
  viewInquiries: false,
  replyInquiries: false,
  viewContacts: false,
  manageContacts: false,
  manageProducts: true,
  manageCategories: true,
  manageCreations: true,
  manageSettings: true,
  manageStaff: false,
  viewAuditLogs: false,
};

export function getDefaultPermissionsForRole(role: StaffRole): AdminPermissions {
  switch (role) {
    case 'super_admin':
      return { ...SUPER_ADMIN_PERMISSIONS };
    case 'order_manager':
      return { ...ORDER_MANAGER_PERMISSIONS };
    case 'customer_support':
      return { ...CUSTOMER_SUPPORT_PERMISSIONS };
    case 'content_manager':
      return { ...CONTENT_MANAGER_PERMISSIONS };
    default:
      return { ...SUPER_ADMIN_PERMISSIONS };
  }
}

export function getRoleLabel(role: StaffRole | string): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return 'Super Admin';
    case 'order_manager':
      return 'Order Manager';
    case 'customer_support':
      return 'Customer Support';
    case 'content_manager':
      return 'Content Manager';
    default:
      return role;
  }
}
