import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore/lite';

export interface AuditLogData {
  action: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: string;
  description: string;
  targetId?: string;
  targetType?: string;
  category?:
    | 'customer_reply'
    | 'order_update'
    | 'product_change'
    | 'category_change'
    | 'creation_change'
    | 'settings_change'
    | 'staff_change'
    | 'auth_action'
    | 'system_action'
    | string;
}

export interface AuditLog extends AuditLogData {
  id?: string;
  userRole?: string;
  details?: string;
  targetDocId?: string;
  targetCollection?: string;
  timestamp?: any;
}

export interface CustomerReplyLog {
  id?: string;
  inquiryId?: string;
  orderId?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  staffUserId: string;
  staffName: string;
  staffEmail: string;
  staffRole: string;
  message: string;
  status?: string;
  timestamp?: any;
}

/**
 * Reusable function to create an audit log entry in Firestore 'auditLogs' collection.
 * Required fields: action, userId, userEmail, userName, role, description.
 * Optional fields: targetId, targetType, category.
 */
export async function createAuditLog(data: AuditLogData): Promise<string | null> {
  try {
    const payload = {
      action: data.action || 'system_action',
      userId: data.userId || '',
      userEmail: data.userEmail || '',
      userName: data.userName || data.userEmail || 'Staff Member',
      role: data.role || 'super_admin',
      userRole: data.role || 'super_admin',
      description: data.description || '',
      details: data.description || '',
      targetId: data.targetId || null,
      targetDocId: data.targetId || null,
      targetType: data.targetType || null,
      targetCollection: data.targetType || null,
      category: data.category || 'system_action',
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'auditLogs'), payload);
    return docRef.id;
  } catch (error) {
    console.error('Error writing to auditLogs collection in Firestore:', error);
    return null;
  }
}

/**
 * Alias for createAuditLog for backward compatibility
 */
export async function logAuditAction(log: any): Promise<string | null> {
  return createAuditLog({
    action: log.action || 'action',
    userId: log.userId || '',
    userEmail: log.userEmail || '',
    userName: log.userName || '',
    role: log.userRole || log.role || 'admin',
    description: log.details || log.description || '',
    targetId: log.targetDocId || log.targetId,
    targetType: log.targetCollection || log.targetType,
    category: log.category,
  });
}

/**
 * Log a customer communication reply to the immutable 'replyLogs' collection in Firestore.
 */
export async function logCustomerReply(
  reply: Omit<CustomerReplyLog, 'id' | 'timestamp'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'replyLogs'), {
      ...reply,
      timestamp: serverTimestamp(),
    });

    // Also record in auditLogs
    await createAuditLog({
      userId: reply.staffUserId,
      userEmail: reply.staffEmail,
      userName: reply.staffName,
      role: reply.staffRole,
      action: 'customer_reply_sent',
      description: `Sent reply to customer ${reply.customerName || reply.customerEmail || ''}`,
      category: 'customer_reply',
      targetType: reply.inquiryId ? 'inquiries' : 'customOrders',
      targetId: reply.inquiryId || reply.orderId || '',
    });

    return docRef.id;
  } catch (error) {
    console.error('Error logging customer reply:', error);
    return null;
  }
}

/**
 * Fetch system-wide audit logs ordered by timestamp descending.
 */
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const logsQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(logsQuery);
    const logs: AuditLog[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const roleVal = data.role || data.userRole || 'admin';
      const descVal = data.description || data.details || '';
      const targetIdVal = data.targetId || data.targetDocId || '';
      const targetTypeVal = data.targetType || data.targetCollection || '';

      logs.push({
        id: docSnap.id,
        action: data.action || 'system_action',
        userId: data.userId || '',
        userEmail: data.userEmail || '',
        userName: data.userName || data.userEmail || 'Staff Member',
        role: roleVal,
        userRole: roleVal,
        description: descVal,
        details: descVal,
        targetId: targetIdVal,
        targetDocId: targetIdVal,
        targetType: targetTypeVal,
        targetCollection: targetTypeVal,
        category: data.category || 'system_action',
        timestamp: data.timestamp || null,
      });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Fetch customer communication reply logs for a specific inquiry or order.
 */
export async function fetchReplyHistoryForRecord(recordId: string): Promise<CustomerReplyLog[]> {
  if (!recordId) return [];

  try {
    const inquiryQuery = query(collection(db, 'replyLogs'), where('inquiryId', '==', recordId));
    const orderQuery = query(collection(db, 'replyLogs'), where('orderId', '==', recordId));

    const [inquirySnap, orderSnap] = await Promise.all([
      getDocs(inquiryQuery).catch(() => null),
      getDocs(orderQuery).catch(() => null),
    ]);

    const replies: CustomerReplyLog[] = [];

    if (inquirySnap) {
      inquirySnap.forEach((docSnap) => {
        const data = docSnap.data();
        replies.push({ id: docSnap.id, ...data } as CustomerReplyLog);
      });
    }

    if (orderSnap) {
      orderSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!replies.some((r) => r.id === docSnap.id)) {
          replies.push({ id: docSnap.id, ...data } as CustomerReplyLog);
        }
      });
    }

    // Sort by timestamp asc
    replies.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeA - timeB;
    });

    return replies;
  } catch (error) {
    console.error('Error fetching reply history:', error);
    return [];
  }
}
