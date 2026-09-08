import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore/lite';

export interface CustomerNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  targetType: 'inquiries' | 'customOrders' | 'contacts';
  targetId: string;
  status?: string;
  read: boolean;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Create a notification record for a customer in Firestore 'notifications' collection.
 */
export async function createCustomerNotification(
  data: Omit<CustomerNotification, 'id' | 'read' | 'createdAt' | 'updatedAt'> & { read?: boolean }
): Promise<string | null> {
  if (!data.userId) return null;

  try {
    const payload = {
      userId: data.userId,
      title: data.title || 'Update on your Bakery Request',
      message: data.message || 'There is an update on your inquiry or custom order.',
      targetType: data.targetType || 'inquiries',
      targetId: data.targetId || '',
      status: data.status || 'updated',
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), payload);
    return docRef.id;
  } catch (error) {
    console.error('Error creating customer notification:', error);
    return null;
  }
}

/**
 * Fetch customer notifications from Firestore.
 */
export async function fetchCustomerNotifications(userId: string): Promise<CustomerNotification[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const results: CustomerNotification[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title || 'Notification',
        message: data.message || '',
        targetType: data.targetType || 'inquiries',
        targetId: data.targetId || '',
        status: data.status,
        read: !!data.read,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      });
    });

    // Sort descending by timestamp
    results.sort((a, b) => {
      const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return results;
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    return [];
  }
}

/**
 * Subscribe to real-time/frequent notification updates for an authenticated customer using Firestore Lite.
 */
export function subscribeCustomerNotifications(
  userId: string,
  onUpdate: (notifications: CustomerNotification[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  let active = true;

  const runFetch = async () => {
    if (!active) return;
    const notifs = await fetchCustomerNotifications(userId);
    if (active) {
      onUpdate(notifs);
    }
  };

  // Initial fetch immediately
  runFetch();

  // Poll every 8 seconds for background updates
  const intervalId = setInterval(runFetch, 8000);

  return () => {
    active = false;
    clearInterval(intervalId);
  };
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  if (!notificationId) return false;
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, {
      read: true,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications for a customer as read.
 */
export async function markAllCustomerNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const notifications = await fetchCustomerNotifications(userId);
    const unread = notifications.filter((n) => !n.read && n.id);

    await Promise.all(
      unread.map((n) => markNotificationAsRead(n.id!))
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}
