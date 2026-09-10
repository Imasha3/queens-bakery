'use client';

import React from 'react';
import Logo from '@/components/Logo';
import { AdminPermissions, AdminProfile, getRoleLabel } from '@/lib/permissions';

export type AdminTab =
  | 'dashboard'
  | 'inquiries'
  | 'customOrders'
  | 'products'
  | 'categories'
  | 'creations'
  | 'contacts'
  | 'settings'
  | 'staff'
  | 'audit';

export interface AdminMenuItem {
  id: AdminTab;
  label: string;
  icon: string;
  permission: keyof AdminPermissions;
  href: string;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: 'viewDashboard', href: '/admin' },
  { id: 'inquiries', label: 'Inquiries', icon: '📋', permission: 'viewInquiries', href: '/admin/inquiries' },
  { id: 'customOrders', label: 'Custom Orders', icon: '🎂', permission: 'viewOrders', href: '/admin/custom-orders' },
  { id: 'products', label: 'Products', icon: '🍰', permission: 'manageProducts', href: '/admin/products' },
  { id: 'categories', label: 'Categories', icon: '🏷️', permission: 'manageCategories', href: '/admin/categories' },
  { id: 'creations', label: 'Our Creations', icon: '🖼️', permission: 'manageCreations', href: '/admin/our-creations' },
  { id: 'contacts', label: 'Contact Messages', icon: '✉️', permission: 'viewContacts', href: '/admin/contact-messages' },
  { id: 'settings', label: 'Social Media Links', icon: '🌐', permission: 'manageSettings', href: '/admin/social-media-links' },
  { id: 'staff', label: 'Staff Management', icon: '👥', permission: 'manageStaff', href: '/admin/staff-management' },
  { id: 'audit', label: 'Audit Logs', icon: '📜', permission: 'viewAuditLogs', href: '/admin/audit-logs' },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab, href: string) => void;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
  adminProfile: AdminProfile | null;
  adminUserEmail: string | null;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  hasPermission,
  adminProfile,
  adminUserEmail,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Reusable Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 min-w-[256px] max-w-[256px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <Logo />
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 text-sm leading-none"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Menu Items Navigation */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto min-h-0">
          {ADMIN_MENU_ITEMS.map((item) => {
            if (!hasPermission(item.permission)) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id, item.href)}
                className={`w-full h-11 flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors duration-200 text-left overflow-hidden select-none flex-shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-base leading-none">
                  {item.icon}
                </span>
                <span className="truncate whitespace-nowrap leading-none flex-grow">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout Section at Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3 flex-shrink-0 bg-slate-900">
          <div className="px-2 py-1 space-y-1">
            <p className="text-xs font-bold text-white truncate">
              {adminProfile?.name || adminUserEmail || 'Admin User'}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase truncate">
                {getRoleLabel(adminProfile?.role || 'super_admin')}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-bold text-slate-400 hover:text-rose-400 transition-all duration-200 flex-shrink-0"
          >
            <span className="w-4 h-4 flex items-center justify-center text-sm leading-none flex-shrink-0">🚪</span>
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
