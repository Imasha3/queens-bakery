import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDocs, setDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore/lite';
import { AdminPermissions, AdminProfile, StaffRole, getDefaultPermissionsForRole } from './permissions';

const firebaseConfig = {
  apiKey: "AIzaSyBuMqJ8LkwWaIPjQqsKAiH49r7SvvDCf0A",
  authDomain: "queens-bakery-d15db.firebaseapp.com",
  projectId: "queens-bakery-d15db",
  storageBucket: "queens-bakery-d15db.firebasestorage.app",
  messagingSenderId: "936359327670",
  appId: "1:936359327670:web:60e086fd630f6276feb317",
  measurementId: "G-91W15SS6NJ",
};

/**
 * Fetch all staff/admin profiles from Firestore 'admins' collection.
 */
export async function fetchStaffAccounts(): Promise<AdminProfile[]> {
  const querySnapshot = await getDocs(collection(db, 'admins'));
  const staffList: AdminProfile[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const rawRole = (data.role || 'super_admin') as StaffRole | 'admin';
    const normalizedRole: StaffRole = rawRole === 'admin' ? 'super_admin' : (rawRole as StaffRole);
    const defaultPerms = getDefaultPermissionsForRole(normalizedRole);

    staffList.push({
      uid: docSnap.id,
      email: data.email || '',
      name: data.name || data.fullName || 'Staff Member',
      role: normalizedRole,
      active: data.active !== undefined ? Boolean(data.active) : true,
      permissions: data.permissions ? { ...defaultPerms, ...data.permissions } : defaultPerms,
      lastLogin: data.lastLogin || null,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
    });
  });

  // Sort by name ascending
  staffList.sort((a, b) => a.name.localeCompare(b.name));
  return staffList;
}

/**
 * Creates a new Firebase Auth account for a staff member using a secondary App instance
 * so the logged-in Main Admin session remains untouched.
 */
export async function createStaffAccount(data: {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  permissions: AdminPermissions;
}): Promise<string> {
  const secondaryAppName = `StaffCreator_${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email.trim(),
      data.password
    );

    const newUid = userCredential.user.uid;

    const staffDocRef = doc(db, 'admins', newUid);
    await setDoc(staffDocRef, {
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      active: true,
      permissions: data.permissions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newUid;
  } finally {
    await deleteApp(secondaryApp);
  }
}

/**
 * Updates a staff member's profile, role, active status, and granular permissions.
 */
export async function updateStaffAccount(
  uid: string,
  data: {
    name?: string;
    role?: StaffRole;
    active?: boolean;
    permissions?: AdminPermissions;
  }
): Promise<void> {
  const docRef = doc(db, 'admins', uid);
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Sends a password reset email for a staff member.
 */
export async function sendStaffPasswordReset(email: string): Promise<void> {
  if (!email || !email.trim()) {
    throw new Error('Valid email address is required to reset password.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Toggles a staff member's active status (active / deactivated).
 */
export async function toggleStaffStatus(uid: string, newActiveState: boolean): Promise<void> {
  const docRef = doc(db, 'admins', uid);
  await setDoc(
    docRef,
    {
      active: newActiveState,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Deletes a staff member document from Firestore 'admins' collection.
 */
export async function deleteStaffAccount(uid: string): Promise<void> {
  const docRef = doc(db, 'admins', uid);
  await deleteDoc(docRef);
}
