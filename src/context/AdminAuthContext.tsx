'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import {
  AdminPermissions,
  AdminProfile,
  SUPER_ADMIN_PERMISSIONS,
  getDefaultPermissionsForRole,
  StaffRole,
} from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';

interface AdminAuthContextType {
  adminUser: User | null;
  isAdmin: boolean;
  adminProfile: AdminProfile | null;
  permissions: AdminPermissions;
  hasPermission: (permKey: keyof AdminPermissions) => boolean;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions>(SUPER_ADMIN_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const parseAdminDoc = (uid: string, data: any): AdminProfile | null => {
    if (!data || data.active === false) return null;

    const rawRole = (data.role || 'super_admin') as StaffRole | 'admin';
    const normalizedRole: StaffRole = rawRole === 'admin' ? 'super_admin' : (rawRole as StaffRole);

    const defaultPerms = getDefaultPermissionsForRole(normalizedRole);
    const customPerms = data.permissions ? { ...defaultPerms, ...data.permissions } : defaultPerms;

    return {
      uid,
      email: data.email || '',
      name: data.name || data.fullName || 'Admin User',
      role: normalizedRole,
      active: data.active !== false,
      permissions: customPerms,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if this UID is present in the admins collection
          const adminDocRef = doc(db, 'admins', firebaseUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            const data = adminDocSnap.data();
            const profile = parseAdminDoc(firebaseUser.uid, data);

            if (profile) {
              setAdminUser(firebaseUser);
              setIsAdmin(true);
              setAdminProfile(profile);
              setPermissions(profile.permissions);
              setError('');

              // Record lastLogin timestamp in Firestore
              setDoc(adminDocRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(() => {});
            } else {
              // Document exists but user is inactive or not authorized
              await signOut(auth);
              setAdminUser(null);
              setIsAdmin(false);
              setAdminProfile(null);
              setPermissions(SUPER_ADMIN_PERMISSIONS);
              setError('Your staff account is deactivated or not authorized.');
            }
          } else {
            // No document in admins collection -> not authorized
            await signOut(auth);
            setAdminUser(null);
            setIsAdmin(false);
            setAdminProfile(null);
            setPermissions(SUPER_ADMIN_PERMISSIONS);
            setError('You are not authorized to access the admin area.');
          }
        } catch (err: any) {
          console.error('Error during admin verification lookup:', err);
          await signOut(auth);
          setAdminUser(null);
          setIsAdmin(false);
          setAdminProfile(null);
          setPermissions(SUPER_ADMIN_PERMISSIONS);
          setError('Verification error. Please contact system support.');
        }
      } else {
        setAdminUser(null);
        setIsAdmin(false);
        setAdminProfile(null);
        setPermissions(SUPER_ADMIN_PERMISSIONS);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Verify immediately
      const adminDocRef = doc(db, 'admins', firebaseUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        const data = adminDocSnap.data();
        const profile = parseAdminDoc(firebaseUser.uid, data);

        if (profile) {
          setAdminUser(firebaseUser);
          setIsAdmin(true);
          setAdminProfile(profile);
          setPermissions(profile.permissions);

          // Audit Log Entry
          createAuditLog({
            action: 'login',
            userId: firebaseUser.uid,
            userEmail: firebaseUser.email || '',
            userName: profile.name,
            role: profile.role,
            description: `User "${profile.name}" (${firebaseUser.email}) logged into Admin Panel`,
            category: 'auth_action',
          }).catch(() => {});
        } else {
          await signOut(auth);
          setAdminUser(null);
          setIsAdmin(false);
          setAdminProfile(null);
          setPermissions(SUPER_ADMIN_PERMISSIONS);
          throw new Error('Your staff account is deactivated or not authorized.');
        }
      } else {
        await signOut(auth);
        setAdminUser(null);
        setIsAdmin(false);
        setAdminProfile(null);
        setPermissions(SUPER_ADMIN_PERMISSIONS);
        throw new Error('You are not authorized to access the admin area.');
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else {
        throw err;
      }
    }
  };

  const adminLogout = async () => {
    setLoading(true);
    try {
      if (adminUser && adminProfile) {
        await createAuditLog({
          action: 'logout',
          userId: adminUser.uid,
          userEmail: adminUser.email || '',
          userName: adminProfile.name,
          role: adminProfile.role,
          description: `User "${adminProfile.name}" (${adminUser.email}) logged out`,
          category: 'auth_action',
        });
      }
      await signOut(auth);
      setAdminUser(null);
      setIsAdmin(false);
      setAdminProfile(null);
      setPermissions(SUPER_ADMIN_PERMISSIONS);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permKey: keyof AdminPermissions): boolean => {
    if (!isAdmin || !adminProfile || !adminProfile.active) return false;
    if (adminProfile.role === 'super_admin') return true;
    return Boolean(permissions[permKey]);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdmin,
        adminProfile,
        permissions,
        hasPermission,
        loading,
        adminLogin,
        adminLogout,
        error,
        setError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
