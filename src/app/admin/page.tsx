'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import Logo from '@/components/Logo';
import { fetchCategories, Category, DEFAULT_CATEGORIES, normalizeCategoryName, resolveCategoryCoverImage } from '@/lib/categories';
import { fetchSocialSettings, updateSocialSettings, SocialSettings, isValidHttpUrl, formatWhatsAppLink } from '@/lib/settings';
import { useApp } from '@/context/AppContext';
import { fetchStaffAccounts, createStaffAccount, updateStaffAccount, toggleStaffStatus, deleteStaffAccount, sendStaffPasswordReset } from '@/lib/staff';
import { StaffRole, AdminPermissions, AdminProfile, SUPER_ADMIN_PERMISSIONS, getDefaultPermissionsForRole, getRoleLabel } from '@/lib/permissions';
import { createAuditLog, logAuditAction, logCustomerReply, fetchAuditLogs, fetchReplyHistoryForRecord, AuditLog, CustomerReplyLog } from '@/lib/audit';
import { createCustomerNotification } from '@/lib/notifications';

interface SummaryStats {
  totalInquiries: number | string;
  pendingInquiries: number | string;
  customOrders: number | string;
  contactMessages: number | string;
}

const PERMISSION_GROUPS: {
  title: string;
  permissions: { key: keyof AdminPermissions; label: string; description: string }[];
}[] = [
  {
    title: '📊 Dashboard & Analytics',
    permissions: [
      { key: 'viewDashboard', label: 'View Dashboard', description: 'Access system overview, revenue, and stats' },
    ],
  },
  {
    title: '🎂 Orders & Inquiries',
    permissions: [
      { key: 'viewOrders', label: 'View Custom Orders', description: 'Access custom order requests' },
      { key: 'manageOrders', label: 'Manage Custom Orders', description: 'Update status, quotes, and delete custom orders' },
      { key: 'viewInquiries', label: 'View Inquiries', description: 'Access customer product inquiries' },
      { key: 'replyInquiries', label: 'Reply to Inquiries', description: 'Send quotes, update status, and delete inquiries' },
    ],
  },
  {
    title: '✉️ Customer Support & Messages',
    permissions: [
      { key: 'viewContacts', label: 'View Contact Messages', description: 'Read contact form messages' },
      { key: 'manageContacts', label: 'Manage Contact Messages', description: 'Mark messages read/unread and delete' },
    ],
  },
  {
    title: '🍰 Catalog & Content Management',
    permissions: [
      { key: 'manageProducts', label: 'Manage Products', description: 'Add, edit, upload images, and delete products' },
      { key: 'manageCategories', label: 'Manage Categories', description: 'Add, edit, seed, and delete categories' },
      { key: 'manageCreations', label: 'Manage Our Creations', description: 'Manage gallery images and showcase' },
    ],
  },
  {
    title: '⚙️ Settings & Administration',
    permissions: [
      { key: 'manageSettings', label: 'Manage Website Links & Settings', description: 'Update Facebook, TikTok, and WhatsApp links' },
      { key: 'manageStaff', label: 'Manage Staff & Permissions', description: 'Create staff accounts, assign roles, and edit permissions' },
      { key: 'viewAuditLogs', label: 'View System Audit Logs', description: 'View immutable system activity history & customer communication logs' },
    ],
  },
];

export default function AdminDashboardPage() {
  const { adminUser, isAdmin, adminProfile, permissions, hasPermission, loading, adminLogout } = useAdminAuth();
  const router = useRouter();

  const [stats, setStats] = useState<SummaryStats>({
    totalInquiries: 'Loading...',
    pendingInquiries: 'Loading...',
    customOrders: 'Loading...',
    contactMessages: 'Loading...'
  });

  type AdminTab = 'dashboard' | 'inquiries' | 'customOrders' | 'products' | 'categories' | 'creations' | 'contacts' | 'settings' | 'staff' | 'audit';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isAdminMobileMenuOpen, setIsAdminMobileMenuOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  // Synchronize URL query param ?tab= with activeTab on mount & popstate
  useEffect(() => {
    const handleUrlTabSync = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as AdminTab | null;
        const validTabs: AdminTab[] = ['dashboard', 'inquiries', 'customOrders', 'products', 'categories', 'creations', 'contacts', 'settings', 'staff', 'audit'];
        if (tabParam && validTabs.includes(tabParam)) {
          setActiveTab(tabParam);
        }
      }
    };

    handleUrlTabSync();
    window.addEventListener('popstate', handleUrlTabSync);
    return () => window.removeEventListener('popstate', handleUrlTabSync);
  }, []);

  const switchTab = (tab: AdminTab) => {
    setSelectedInquiry(null);
    setSelectedCustomOrder(null);
    setSelectedProduct(null);
    setIsEditingProduct(false);
    setIsAddingProduct(false);
    setSelectedCategoryItem(null);
    setIsEditingCategory(false);
    setIsAddingCategory(false);
    if (typeof setSelectedCreation === 'function') setSelectedCreation(null);
    if (typeof setIsEditingCreation === 'function') setIsEditingCreation(false);
    if (typeof setIsAddingCreation === 'function') setIsAddingCreation(false);
    if (typeof setSelectedContactMessage === 'function') setSelectedContactMessage(null);
    if (typeof setSelectedStaff === 'function') setSelectedStaff(null);
    if (typeof setIsEditingStaff === 'function') setIsEditingStaff(false);
    if (typeof setIsAddingStaff === 'function') setIsAddingStaff(false);

    setActiveTab(tab);
    setIsAdminMobileMenuOpen(false);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Confirm/Reject Order Modal State
  const [orderActionModal, setOrderActionModal] = useState<{
    isOpen: boolean;
    action: 'confirm' | 'reject';
    itemType: 'inquiry' | 'customOrder';
    item: any;
  } | null>(null);
  const [submittingOrderAction, setSubmittingOrderAction] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  // Response Form State
  const [quotedPrice, setQuotedPrice] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [adminMessage, setAdminMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('pending');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseError, setResponseError] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [saveSuccessButton, setSaveSuccessButton] = useState(false);

  // Custom Orders State
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [customOrdersLoading, setCustomOrdersLoading] = useState(false);
  const [selectedCustomOrder, setSelectedCustomOrder] = useState<any | null>(null);

  // Custom Orders Response Form State
  const [customOrderQuotedPrice, setCustomOrderQuotedPrice] = useState('');
  const [customOrderAdminMessage, setCustomOrderAdminMessage] = useState('');
  const [customOrderStatus, setCustomOrderStatus] = useState('pending');
  const [submittingCustomOrderResponse, setSubmittingCustomOrderResponse] = useState(false);
  const [customOrderResponseError, setCustomOrderResponseError] = useState('');
  const [customOrderResponseSuccess, setCustomOrderResponseSuccess] = useState(false);
  const [saveSuccessCustomOrderButton, setSaveSuccessCustomOrderButton] = useState(false);

  const fetchCustomOrders = async () => {
    setCustomOrdersLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'customOrders'));
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side by createdAt desc
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setCustomOrders(fetched);
    } catch (err) {
      console.error('Error fetching custom orders list:', err);
    } finally {
      setCustomOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'customOrders' && adminUser && isAdmin) {
      fetchCustomOrders();
    }
  }, [activeTab, adminUser, isAdmin]);

  // Sync custom order detail fields when selected
  useEffect(() => {
    if (selectedCustomOrder) {
      setCustomOrderQuotedPrice(selectedCustomOrder.quotedPrice || '');
      setCustomOrderAdminMessage(selectedCustomOrder.adminMessage || '');
      setCustomOrderStatus(selectedCustomOrder.status || 'pending');
      setCustomOrderResponseError('');
      setCustomOrderResponseSuccess(false);
    }
  }, [selectedCustomOrder]);

  const handleUpdateCustomOrderResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomOrder) return;

    setSubmittingCustomOrderResponse(true);
    setCustomOrderResponseError('');
    setCustomOrderResponseSuccess(false);

    try {
      const docRef = doc(db, 'customOrders', selectedCustomOrder.id);
      
      const updateData = {
        status: customOrderStatus,
        quotedPrice: customOrderQuotedPrice || null,
        adminMessage: customOrderAdminMessage || null,
        updatedAt: serverTimestamp(),
        respondedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);

      // Trigger customer notification
      if (selectedCustomOrder.userId) {
        const titleStr = customOrderStatus === 'confirmed'
          ? '🎉 Custom Order Confirmed!'
          : customOrderStatus === 'preparing'
          ? '👨‍🍳 Your Order is Being Prepared!'
          : customOrderStatus === 'ready'
          ? '🎂 Your Order is Ready!'
          : customOrderStatus === 'completed'
          ? '✅ Custom Order Completed'
          : customOrderStatus === 'cancelled'
          ? 'Notice: Custom Order Cancelled'
          : `Custom Order Status: ${customOrderStatus.replace('_', ' ').toUpperCase()}`;

        const msgStr = customOrderAdminMessage.trim()
          ? (customOrderQuotedPrice ? `Quote LKR ${Number(customOrderQuotedPrice).toLocaleString()}: ${customOrderAdminMessage.trim()}` : customOrderAdminMessage.trim())
          : `Your order status has been updated to ${customOrderStatus.replace('_', ' ')}.`;

        await createCustomerNotification({
          userId: selectedCustomOrder.userId,
          title: titleStr,
          message: msgStr,
          targetType: 'customOrders',
          targetId: selectedCustomOrder.id,
          status: customOrderStatus,
        });
      }

      if (customOrderAdminMessage.trim() || customOrderQuotedPrice) {
        await logCustomerReply({
          orderId: selectedCustomOrder.id,
          customerId: selectedCustomOrder.userId || '',
          customerEmail: selectedCustomOrder.email || '',
          customerName: selectedCustomOrder.fullName || selectedCustomOrder.name || '',
          staffUserId: adminUser?.uid || '',
          staffName: adminProfile?.name || 'Staff Member',
          staffEmail: adminUser?.email || '',
          staffRole: adminProfile?.role || 'super_admin',
          message: customOrderAdminMessage.trim() ? `Quote LKR ${customOrderQuotedPrice || 0}: ${customOrderAdminMessage}` : `Quote: LKR ${customOrderQuotedPrice || 0}`,
          status: customOrderStatus,
        });
      } else {
        await recordAudit(
          `Updated Custom Order status to "${customOrderStatus}" for ${selectedCustomOrder.fullName || selectedCustomOrder.name || 'Customer'}`,
          'order_update',
          'customOrders',
          selectedCustomOrder.id
        );
      }

      // Re-fetch custom orders list
      await fetchCustomOrders();

      // Update selected custom order locally
      setSelectedCustomOrder((prev: any) => ({
        ...prev,
        ...updateData,
        respondedAt: { toDate: () => new Date() } // temporary local timestamp display
      }));

      // Re-fetch dashboard stats counts
      const overviewStats = async () => {
        try {
          const customSnap = await getDocs(collection(db, 'customOrders'));
          setStats(prev => ({
            ...prev,
            customOrders: customSnap.size
          }));
        } catch (err) {
          console.error(err);
        }
      };
      overviewStats();

      setCustomOrderResponseSuccess(true);
      setSaveSuccessCustomOrderButton(true);
      setTimeout(() => {
        setSaveSuccessCustomOrderButton(false);
      }, 2500);
    } catch (err: any) {
      console.error('Error updating custom order response:', err);
      setCustomOrderResponseError('Unable to save response. Please try again.');
    } finally {
      setSubmittingCustomOrderResponse(false);
    }
  };

  const executeOrderAction = async () => {
    if (!orderActionModal || !orderActionModal.item) return;
    const { action, itemType, item } = orderActionModal;
    setSubmittingOrderAction(true);

    try {
      const collectionName = itemType === 'inquiry' ? 'inquiries' : 'customOrders';
      const targetStatus = action === 'confirm' ? 'confirmed' : 'rejected';
      const docRef = doc(db, collectionName, item.id);

      const updateData = {
        status: targetStatus,
        updatedAt: serverTimestamp(),
        respondedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);

      // Customer Notification
      const recipientId = item.userId;
      if (recipientId) {
        const titleStr = action === 'confirm'
          ? '🎉 Order Confirmed!'
          : 'Notice: Order Status Update';
        const msgStr = action === 'confirm'
          ? "Your order has been confirmed by Queen's Bakery."
          : "Unfortunately, your order could not be accepted at this time.";

        await createCustomerNotification({
          userId: recipientId,
          title: titleStr,
          message: msgStr,
          targetType: collectionName,
          targetId: item.id,
          status: targetStatus,
        });
      }

      // Audit Log
      const customerName = item.customerName || item.fullName || item.name || 'Customer';
      await recordAudit(
        `${action === 'confirm' ? 'Confirmed' : 'Rejected'} ${itemType === 'inquiry' ? 'Inquiry' : 'Custom Order'} for ${customerName}`,
        'order_update',
        collectionName,
        item.id
      );

      // Refresh list
      if (itemType === 'inquiry') {
        await fetchInquiries();
        if (selectedInquiry?.id === item.id) {
          setSelectedInquiry((prev: any) => (prev ? { ...prev, status: targetStatus } : null));
          setInquiryStatus(targetStatus);
        }
      } else {
        await fetchCustomOrders();
        if (selectedCustomOrder?.id === item.id) {
          setSelectedCustomOrder((prev: any) => (prev ? { ...prev, status: targetStatus } : null));
          setCustomOrderStatus(targetStatus);
        }
      }

      setOrderActionModal(null);
    } catch (err: any) {
      console.error('Error executing order action:', err);
      alert(`Failed to ${action} order: ${err?.message || 'Unknown error'}`);
    } finally {
      setSubmittingOrderAction(false);
    }
  };

  // Products Management State
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Form attributes for Product
  const [prodName, setProdName] = useState('');
  const [prodSlug, setProdSlug] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodLongDescription, setProdLongDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodImagePublicId, setProdImagePublicId] = useState('');
  const [prodImages, setProdImages] = useState('');
  const [galleryPublicIds, setGalleryPublicIds] = useState<string[]>([]);
  
  // File upload state hooks
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadingState, setUploadingState] = useState(false);
  const [prodSizes, setProdSizes] = useState('');
  const [prodFlavours, setProdFlavours] = useState('');
  const [prodStyles, setProdStyles] = useState('');
  const [prodAllowCustomMessage, setProdAllowCustomMessage] = useState(false);
  const [prodActive, setProdActive] = useState(true);

  // Form submission feedback
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [productResponseError, setProductResponseError] = useState('');
  const [productResponseSuccess, setProductResponseSuccess] = useState(false);
  const [saveSuccessProductButton, setSaveSuccessProductButton] = useState(false);

  // Categories State & Management
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<Category | null>(null);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [catNameInput, setCatNameInput] = useState('');
  const [catDescInput, setCatDescInput] = useState('');

  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [categoryResponseError, setCategoryResponseError] = useState('');
  const [categoryResponseSuccess, setCategoryResponseSuccess] = useState(false);
  const [saveSuccessCategoryButton, setSaveSuccessCategoryButton] = useState(false);

  // Category Cover Image Modal State
  const [coverModalCategory, setCoverModalCategory] = useState<Category | null>(null);
  const [uploadingCategoryCover, setUploadingCategoryCover] = useState(false);
  const [categoryCoverError, setCategoryCoverError] = useState('');

  const handleSelectCategoryCoverImage = async (categoryId: string, imageUrl: string, imagePublicId?: string) => {
    try {
      await setDoc(
        doc(db, 'categories', categoryId),
        { image: imageUrl || '', imagePublicId: imagePublicId || '', updatedAt: serverTimestamp() },
        { merge: true }
      );
      await recordAudit(
        `Updated category cover image for "${coverModalCategory?.name || categoryId}"`,
        'category_change',
        'categories',
        categoryId
      );
      await loadAdminCategories();
      setCoverModalCategory(null);
    } catch (err: any) {
      console.error('Error updating category cover image:', err);
      alert(err?.message || 'Failed to update category cover image.');
    }
  };

  const handleUploadCategoryCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !coverModalCategory) return;

    setUploadingCategoryCover(true);
    setCategoryCoverError('');

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dycqf6xbh';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'queens-bakery';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Image upload failed.');
      }

      const data = await res.json();
      await handleSelectCategoryCoverImage(coverModalCategory.id, data.secure_url, data.public_id);
    } catch (err: any) {
      console.error('Error uploading category cover image:', err);
      setCategoryCoverError('Upload failed. Please try again.');
    } finally {
      setUploadingCategoryCover(false);
    }
  };

  const loadAdminCategories = async () => {
    setCategoriesLoading(true);
    try {
      const cats = await fetchCategories();
      setCategoriesList(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSeedDefaultCategories = async () => {
    setCategoriesLoading(true);
    setCategoryResponseError('');
    setCategoryResponseSuccess(false);

    try {
      for (const catName of DEFAULT_CATEGORIES) {
        const catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const docRef = doc(db, 'categories', catId);
        await setDoc(
          docRef,
          {
            name: catName,
            description: `Queen's Bakery ${catName} collection`,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      await loadAdminCategories();
      setCategoryResponseSuccess(true);
      setTimeout(() => setCategoryResponseSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error seeding default categories:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setCategoryResponseError(
          'Firebase Error: Missing or insufficient permissions. Please check that your Firestore Security Rules in Firebase Console allow writes to "categories".'
        );
      } else {
        setCategoryResponseError(err?.message || 'Unable to seed initial categories.');
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser && isAdmin) {
      loadAdminCategories();
    }
  }, [adminUser, isAdmin]);

  // Sync Category form inputs when editing or adding
  useEffect(() => {
    if (selectedCategoryItem && isEditingCategory) {
      setCatNameInput(selectedCategoryItem.name || '');
      setCatDescInput(selectedCategoryItem.description || '');
      setCategoryResponseError('');
      setCategoryResponseSuccess(false);
    } else if (isAddingCategory) {
      setCatNameInput('');
      setCatDescInput('');
      setCategoryResponseError('');
      setCategoryResponseSuccess(false);
    }
  }, [selectedCategoryItem, isEditingCategory, isAddingCategory]);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) {
      setCategoryResponseError('Category name is required.');
      return;
    }

    setSubmittingCategory(true);
    setCategoryResponseError('');
    setCategoryResponseSuccess(false);

    try {
      const catName = catNameInput.trim();
      let catId = selectedCategoryItem?.id;
      if (!catId) {
        catId = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      const categoryPayload = {
        name: catName,
        description: catDescInput.trim(),
        updatedAt: serverTimestamp(),
        ...(selectedCategoryItem ? {} : { createdAt: serverTimestamp() }),
      };

      await setDoc(doc(db, 'categories', catId), categoryPayload, { merge: true });

      await loadAdminCategories();

      setCategoryResponseSuccess(true);
      setSaveSuccessCategoryButton(true);

      setTimeout(() => {
        setSaveSuccessCategoryButton(false);
        if (!isEditingCategory) {
          setCatNameInput('');
          setCatDescInput('');
          setIsAddingCategory(false);
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error saving category:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setCategoryResponseError(
          'Firebase Error: Missing or insufficient permissions. Please check that your account has Admin privileges and update your Firestore Security Rules in Firebase Console.'
        );
      } else {
        setCategoryResponseError(err?.message || 'Unable to save category. Please try again.');
      }
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the category "${cat.name}"? Products in this category will remain, but this category option will be removed from future selection.`
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'categories', cat.id));
      await loadAdminCategories();
      if (selectedCategoryItem?.id === cat.id) {
        setSelectedCategoryItem(null);
        setIsEditingCategory(false);
      }
    } catch (err: any) {
      console.error('Error deleting category:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        alert(
          'Firebase Error: Missing or insufficient permissions to delete this category. Please check your Firestore Security Rules.'
        );
      } else {
        alert(err?.message || 'Unable to delete category. Please try again.');
      }
    }
  };

  // Social Media Links Settings State & Handlers
  const { refreshSocialSettings } = useApp();
  const [fbUrlInput, setFbUrlInput] = useState('');
  const [ttUrlInput, setTtUrlInput] = useState('');
  const [waUrlInput, setWaUrlInput] = useState('');

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [submittingSettings, setSubmittingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const loadAdminSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await fetchSocialSettings();
      setFbUrlInput(data.facebook || '');
      setTtUrlInput(data.tiktok || '');
      setWaUrlInput(data.whatsapp || '');
    } catch (err) {
      console.error('Error loading social settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser && isAdmin && activeTab === 'settings') {
      loadAdminSettings();
    }
  }, [adminUser, isAdmin, activeTab]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess(false);

    // Validate Facebook URL if provided
    if (fbUrlInput.trim() && !isValidHttpUrl(fbUrlInput.trim())) {
      setSettingsError('Facebook URL must be a valid website link starting with http:// or https://');
      return;
    }

    // Validate TikTok URL if provided
    if (ttUrlInput.trim() && !isValidHttpUrl(ttUrlInput.trim())) {
      setSettingsError('TikTok URL must be a valid website link starting with http:// or https://');
      return;
    }

    setSubmittingSettings(true);

    try {
      const formattedWa = formatWhatsAppLink(waUrlInput.trim());
      await updateSocialSettings({
        facebook: fbUrlInput.trim(),
        tiktok: ttUrlInput.trim(),
        whatsapp: formattedWa,
      });

      setWaUrlInput(formattedWa);
      await refreshSocialSettings();
      setSettingsSuccess(true);

      await recordAudit('Updated Social Media Links & Site Settings', 'settings_change', 'settings', 'socialMedia');

      setTimeout(() => {
        setSettingsSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('Error updating social settings:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setSettingsError(
          'Firebase Error: Missing or insufficient permissions to update settings. Please check your Firestore Security Rules.'
        );
      } else {
        setSettingsError(err?.message || 'Unable to update settings. Please try again.');
      }
    } finally {
      setSubmittingSettings(false);
    }
  };

  // Automatic tab redirection if user lacks permission for current activeTab
  useEffect(() => {
    if (isAdmin && !loading) {
      const tabPermissionsMap: Record<string, keyof AdminPermissions> = {
        dashboard: 'viewDashboard',
        inquiries: 'viewInquiries',
        customOrders: 'viewOrders',
        products: 'manageProducts',
        categories: 'manageCategories',
        creations: 'manageCreations',
        contacts: 'viewContacts',
        settings: 'manageSettings',
        staff: 'manageStaff',
        audit: 'viewAuditLogs',
      };

      const currentPermKey = tabPermissionsMap[activeTab];
      if (currentPermKey && !hasPermission(currentPermKey)) {
        const firstAllowedTab = Object.keys(tabPermissionsMap).find((tab) =>
          hasPermission(tabPermissionsMap[tab])
        );
        if (firstAllowedTab) {
          setActiveTab(firstAllowedTab as any);
        }
      }
    }
  }, [isAdmin, loading, activeTab, permissions]);

  // Staff Management State & Handlers
  const [auditLogsList, setAuditLogsList] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');

  const [recordCommunicationHistory, setRecordCommunicationHistory] = useState<CustomerReplyLog[]>([]);
  const [loadingCommunicationHistory, setLoadingCommunicationHistory] = useState(false);

  const loadAuditLogs = async () => {
    setAuditLogsLoading(true);
    setAuditLogsError('');
    try {
      const logs = await fetchAuditLogs();
      setAuditLogsList(logs);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setAuditLogsError('Firebase Error: Missing or insufficient permissions to view audit logs.');
      } else {
        setAuditLogsError(err?.message || 'Failed to load system audit logs.');
      }
    } finally {
      setAuditLogsLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser && isAdmin && activeTab === 'audit' && hasPermission('viewAuditLogs')) {
      loadAuditLogs();
    }
  }, [adminUser, isAdmin, activeTab]);

  const loadRecordCommunication = async (recordId: string) => {
    if (!recordId) return;
    setLoadingCommunicationHistory(true);
    try {
      const history = await fetchReplyHistoryForRecord(recordId);
      setRecordCommunicationHistory(history);
    } catch (err) {
      console.error('Error fetching communication history:', err);
    } finally {
      setLoadingCommunicationHistory(false);
    }
  };

  useEffect(() => {
    if (selectedInquiry?.id) {
      loadRecordCommunication(selectedInquiry.id);
    }
  }, [selectedInquiry?.id]);

  useEffect(() => {
    if (selectedCustomOrder?.id) {
      loadRecordCommunication(selectedCustomOrder.id);
    }
  }, [selectedCustomOrder?.id]);

  const [staffList, setStaffList] = useState<AdminProfile[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminProfile | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);

  const [staffNameInput, setStaffNameInput] = useState('');
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [staffRoleInput, setStaffRoleInput] = useState<StaffRole>('order_manager');
  const [staffPermsInput, setStaffPermsInput] = useState<AdminPermissions>(getDefaultPermissionsForRole('order_manager'));
  const [staffActiveInput, setStaffActiveInput] = useState(true);

  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [staffResponseError, setStaffResponseError] = useState('');
  const [staffResponseSuccess, setStaffResponseSuccess] = useState(false);

  const loadStaffData = async () => {
    setStaffLoading(true);
    try {
      const list = await fetchStaffAccounts();
      setStaffList(list);
    } catch (err) {
      console.error('Error fetching staff list:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser && isAdmin && activeTab === 'staff' && hasPermission('manageStaff')) {
      loadStaffData();
    }
  }, [adminUser, isAdmin, activeTab]);

  const handleRoleSelectChange = (newRole: StaffRole) => {
    setStaffRoleInput(newRole);
    setStaffPermsInput(getDefaultPermissionsForRole(newRole));
  };

  const handlePermissionToggle = (permKey: keyof AdminPermissions) => {
    setStaffPermsInput((prev) => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  const handleOpenAddStaff = () => {
    setSelectedStaff(null);
    setIsEditingStaff(false);
    setIsAddingStaff(true);
    setStaffNameInput('');
    setStaffEmailInput('');
    setStaffPasswordInput('');
    setStaffRoleInput('order_manager');
    setStaffPermsInput(getDefaultPermissionsForRole('order_manager'));
    setStaffActiveInput(true);
    setStaffResponseError('');
    setStaffResponseSuccess(false);
  };

  const handleOpenEditStaff = (staff: AdminProfile) => {
    setSelectedStaff(staff);
    setIsAddingStaff(false);
    setIsEditingStaff(true);
    setStaffNameInput(staff.name || '');
    setStaffEmailInput(staff.email || '');
    setStaffPasswordInput('');
    setStaffRoleInput(staff.role || 'order_manager');
    setStaffPermsInput(staff.permissions || getDefaultPermissionsForRole(staff.role || 'order_manager'));
    setStaffActiveInput(Boolean(staff.active));
    setStaffResponseError('');
    setStaffResponseSuccess(false);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffResponseError('');
    setStaffResponseSuccess(false);

    if (!staffNameInput.trim()) {
      setStaffResponseError('Staff member name is required.');
      return;
    }

    if (isAddingStaff) {
      if (!staffEmailInput.trim() || !staffEmailInput.includes('@')) {
        setStaffResponseError('Please enter a valid email address.');
        return;
      }
      if (!staffPasswordInput || staffPasswordInput.length < 6) {
        setStaffResponseError('Password must be at least 6 characters long.');
        return;
      }
    }

    setSubmittingStaff(true);

    try {
      if (isAddingStaff) {
        await createStaffAccount({
          name: staffNameInput.trim(),
          email: staffEmailInput.trim(),
          password: staffPasswordInput,
          role: staffRoleInput,
          permissions: staffPermsInput,
        });
      } else if (isEditingStaff && selectedStaff) {
        await updateStaffAccount(selectedStaff.uid, {
          name: staffNameInput.trim(),
          role: staffRoleInput,
          active: staffActiveInput,
          permissions: staffPermsInput,
        });
      }

      await loadStaffData();
      setStaffResponseSuccess(true);

      await recordAudit(
        isAddingStaff ? `Created new staff account "${staffNameInput.trim()}" (${staffEmailInput.trim()})` : `Updated staff permissions for "${staffNameInput.trim()}"`,
        'staff_change',
        'admins',
        selectedStaff?.uid,
        `Assigned Role: ${staffRoleInput}`
      );

      setTimeout(() => {
        setStaffResponseSuccess(false);
        setIsAddingStaff(false);
        setIsEditingStaff(false);
        setSelectedStaff(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving staff account:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setStaffResponseError('An account with this email address already exists.');
      } else if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
        setStaffResponseError('Firebase Error: Missing or insufficient permissions to manage staff accounts.');
      } else {
        setStaffResponseError(err?.message || 'Failed to save staff account.');
      }
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleToggleStaffActive = async (staff: AdminProfile) => {
    if (staff.uid === adminUser?.uid) {
      alert("You cannot deactivate your own logged-in account!");
      return;
    }
    const nextActive = !staff.active;
    try {
      await toggleStaffStatus(staff.uid, nextActive);
      await loadStaffData();

      await recordAudit(
        `${nextActive ? 'Activated' : 'Deactivated'} staff account "${staff.name}" (${staff.email})`,
        'staff_change',
        'admins',
        staff.uid
      );
    } catch (err: any) {
      console.error('Error toggling staff status:', err);
      alert(err?.message || 'Failed to update staff status.');
    }
  };

  const handleDeleteStaffMember = async (staff: AdminProfile) => {
    if (staff.uid === adminUser?.uid) {
      alert("You cannot delete your own logged-in account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete staff account "${staff.name}" (${staff.email})?`)) {
      return;
    }

    try {
      await deleteStaffAccount(staff.uid);
      await loadStaffData();

      await recordAudit(
        `Deleted staff account "${staff.name}" (${staff.email})`,
        'staff_change',
        'admins',
        staff.uid
      );

      if (selectedStaff?.uid === staff.uid) {
        setSelectedStaff(null);
        setIsEditingStaff(false);
      }
    } catch (err: any) {
      console.error('Error deleting staff account:', err);
      alert(err?.message || 'Failed to delete staff account.');
    }
  };

  const recordAudit = async (
    action: string,
    category?: AuditLog['category'],
    targetType?: string,
    targetId?: string,
    description?: string
  ) => {
    if (!adminUser) return;
    await createAuditLog({
      action,
      userId: adminUser.uid,
      userEmail: adminUser.email || '',
      userName: adminProfile?.name || adminUser.email || 'Staff Member',
      role: adminProfile?.role || 'super_admin',
      description: description || action,
      targetId: targetId || undefined,
      targetType: targetType || undefined,
      category: category || 'system_action',
    });
  };

  const handleResetStaffPasswordAction = async (staff: AdminProfile) => {
    if (!staff.email) return;
    if (!window.confirm(`Send a Password Reset link to "${staff.name}" (${staff.email})?`)) {
      return;
    }
    try {
      await sendStaffPasswordReset(staff.email);
      alert(`Password reset link sent to ${staff.email}.`);
      await recordAudit(
        `Sent password reset email to staff member "${staff.name}" (${staff.email})`,
        'staff_change',
        'admins',
        staff.uid
      );
    } catch (err: any) {
      console.error('Error sending staff password reset:', err);
      alert(err?.message || 'Failed to send password reset email.');
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side by name ascending
      fetched.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(fetched);
    } catch (err) {
      console.error('Error fetching products list:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products' && adminUser && isAdmin) {
      fetchProducts();
    }
  }, [activeTab, adminUser, isAdmin]);

  // Sync form inputs when editing or adding a product
  useEffect(() => {
    // Reset upload/file states
    setPrimaryFile(null);
    setPrimaryPreview('');
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setUploadError('');
    setUploadingState(false);

    if (selectedProduct && isEditingProduct) {
      setProdName(selectedProduct.name || '');
      setProdSlug(selectedProduct.slug || '');
      setProdCategory(selectedProduct.category || '');
      setProdDescription(selectedProduct.description || '');
      setProdLongDescription(selectedProduct.longDescription || '');
      setProdImage(selectedProduct.image || '');
      setProdImagePublicId(selectedProduct.imagePublicId || '');
      setProdImages(selectedProduct.images ? selectedProduct.images.join(', ') : '');
      setGalleryUrls(selectedProduct.images || []);
      setGalleryPublicIds(selectedProduct.imagesPublicIds || []);
      
      const opts = selectedProduct.options || {};
      setProdSizes(opts.sizes ? opts.sizes.join(', ') : '');
      setProdFlavours(opts.flavours ? opts.flavours.join(', ') : '');
      setProdStyles(opts.styles ? opts.styles.join(', ') : '');
      setProdAllowCustomMessage(opts.allowCustomMessage || false);
      
      setProdActive(selectedProduct.active !== false);
      setProductResponseError('');
      setProductResponseSuccess(false);
    } else if (isAddingProduct) {
      setProdName('');
      setProdSlug('');
      setProdCategory('Cakes');
      setProdDescription('');
      setProdLongDescription('');
      setProdImage('');
      setProdImagePublicId('');
      setProdImages('');
      setGalleryUrls([]);
      setGalleryPublicIds([]);
      setProdSizes('');
      setProdFlavours('');
      setProdStyles('');
      setProdAllowCustomMessage(false);
      setProdActive(true);
      setProductResponseError('');
      setProductResponseSuccess(false);
    }
  }, [selectedProduct, isEditingProduct, isAddingProduct]);

  // Handle Create or Edit Product with Cloudinary uploads
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setProductResponseError('');
    setProductResponseSuccess(false);
    setUploadError('');

    // Helpers to parse comma-separated lists
    const parseList = (str: string) => {
      if (!str) return [];
      return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
    };

    try {
      // 1. Get or generate the product ID
      let prodId = selectedProduct?.id;
      if (!prodId) {
        const newDocRef = doc(collection(db, 'products'));
        prodId = newDocRef.id;
      }

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dycqf6xbh';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'queens-bakery';

      // 2. Upload Primary Image File to Cloudinary if selected
      let finalImageUrl = prodImage;
      let finalImagePublicId = prodImagePublicId;

      if (primaryFile) {
        setUploadError('Uploading image...');
        
        const formData = new FormData();
        formData.append('file', primaryFile);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'products');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('Image upload failed.');
        }

        const data = await res.json();
        finalImageUrl = data.secure_url;
        finalImagePublicId = data.public_id;

        // Delete old primary image securely via server API if replacing
        if (prodImagePublicId) {
          try {
            await fetch('/api/admin/delete-cloudinary-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: prodImagePublicId })
            });
          } catch (delErr) {
            console.error('Failed to delete old primary image:', delErr);
          }
        }
      }

      if (!finalImageUrl && !primaryFile) {
        throw new Error('A primary product image is required.');
      }

      // 3. Upload new Gallery Files if selected
      const uploadedGalleryUrls: string[] = [];
      const uploadedGalleryPublicIds: string[] = [];

      for (const file of newGalleryFiles) {
        setUploadError(`Uploading gallery image ${file.name}...`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'products');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('Image upload failed.');
        }

        const data = await res.json();
        uploadedGalleryUrls.push(data.secure_url);
        uploadedGalleryPublicIds.push(data.public_id);
      }

      // Combine existing gallery URLs/PublicIds (that weren't deleted) with new uploads
      const finalGalleryUrls = [...galleryUrls, ...uploadedGalleryUrls];
      const finalGalleryPublicIds = [...galleryPublicIds, ...uploadedGalleryPublicIds];

      setUploadError('');

      // 4. Save to Firestore products collection using setDoc
      const productPayload = {
        name: prodName,
        slug: prodSlug || prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        category: prodCategory,
        description: prodDescription,
        longDescription: prodLongDescription,
        image: finalImageUrl,
        imagePublicId: finalImagePublicId,
        images: finalGalleryUrls,
        imagesPublicIds: finalGalleryPublicIds,
        active: prodActive,
        options: {
          sizes: parseList(prodSizes),
          flavours: parseList(prodFlavours),
          styles: parseList(prodStyles),
          allowCustomMessage: prodAllowCustomMessage
        }
      };

      await setDoc(doc(db, 'products', prodId), productPayload);

      // Auto-assign category cover image if category currently has no cover image set in Firestore
      if (finalImageUrl) {
        const targetCategory = categoriesList.find(
          (c) => normalizeCategoryName(c.name) === normalizeCategoryName(prodCategory)
        );
        if (targetCategory && (!targetCategory.image || targetCategory.image.trim() === '')) {
          try {
            await setDoc(
              doc(db, 'categories', targetCategory.id),
              { image: finalImageUrl, imagePublicId: finalImagePublicId || '', updatedAt: serverTimestamp() },
              { merge: true }
            );
            await loadAdminCategories();
          } catch (catErr) {
            console.error('Error auto-setting category cover image:', catErr);
          }
        }
      }

      await recordAudit(
        isEditingProduct ? `Updated product "${prodName}"` : `Created new product "${prodName}"`,
        'product_change',
        'products',
        prodId,
        `Category: ${prodCategory}`
      );

      await fetchProducts();

      // Reset file selectors
      setPrimaryFile(null);
      setPrimaryPreview('');
      setNewGalleryFiles([]);
      setNewGalleryPreviews([]);

      // Update inputs state to match saved data
      setProdImage(finalImageUrl);
      setProdImagePublicId(finalImagePublicId);
      setGalleryUrls(finalGalleryUrls);
      setGalleryPublicIds(finalGalleryPublicIds);

      setProductResponseSuccess(true);
      setSaveSuccessProductButton(true);

      setTimeout(() => {
        setSaveSuccessProductButton(false);
        if (!isEditingProduct) {
          // If was adding, reset form fields
          setProdName('');
          setProdSlug('');
          setProdDescription('');
          setProdLongDescription('');
          setProdImage('');
          setProdImagePublicId('');
          setProdImages('');
          setGalleryUrls([]);
          setGalleryPublicIds([]);
          setProdSizes('');
          setProdFlavours('');
          setProdStyles('');
          setProdAllowCustomMessage(false);
          setProdActive(true);
        }
      }, 2500);

    } catch (err: any) {
      console.error('Error saving product:', err);
      if (err.message === 'Image upload failed.') {
        setUploadError('Image upload failed. Please try again.');
      } else {
        setProductResponseError(err.message || 'Unable to save product. Please try again.');
      }
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Handle Delete Product with Cloudinary removal
  const handleDeleteProduct = async (productId: string, productName: string, primaryPublicId?: string, galleryPublicIdsArray?: string[]) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'products', productId));
      
      // 2. Delete primary image from Cloudinary securely via server API route
      if (primaryPublicId) {
        try {
          await fetch('/api/admin/delete-cloudinary-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: primaryPublicId })
          });
        } catch (delErr) {
          console.error('Failed to delete primary image from Cloudinary:', delErr);
        }
      }

      // 3. Delete gallery images from Cloudinary securely via server API route
      if (galleryPublicIdsArray && galleryPublicIdsArray.length > 0) {
        for (const pubId of galleryPublicIdsArray) {
          try {
            await fetch('/api/admin/delete-cloudinary-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: pubId })
            });
          } catch (delErr) {
            console.error('Failed to delete gallery image from Cloudinary:', delErr);
          }
        }
      }

      // 4. Automatically fallback category cover image if the deleted product held the category cover image
      const deletedProduct = products.find((p) => p.id === productId);
      if (deletedProduct && deletedProduct.image) {
        const affectedCat = categoriesList.find(
          (c) => c.image && c.image.trim() === deletedProduct.image.trim()
        );
        if (affectedCat) {
          const remainingProducts = products.filter(
            (p) =>
              p.id !== productId &&
              p.active &&
              normalizeCategoryName(p.category) === normalizeCategoryName(affectedCat.name) &&
              p.image &&
              p.image.trim() !== ''
          );
          const newCoverImage = remainingProducts.length > 0 ? remainingProducts[0].image : '';
          const newCoverPublicId = remainingProducts.length > 0 ? (remainingProducts[0].imagePublicId || '') : '';

          try {
            await setDoc(
              doc(db, 'categories', affectedCat.id),
              { image: newCoverImage, imagePublicId: newCoverPublicId, updatedAt: serverTimestamp() },
              { merge: true }
            );
            await loadAdminCategories();
          } catch (catErr) {
            console.error('Error falling back category cover image:', catErr);
          }
        }
      }

      await fetchProducts();

      await recordAudit(
        `Deleted product "${productName}"`,
        'product_change',
        'products',
        productId
      );
      
      // If deleted the currently viewed product, reset selectedProduct
      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(null);
        setIsEditingProduct(false);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Unable to delete product. Please check permissions.');
    }
  };

  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setUploadError('Invalid file type. Supported formats: JPG, JPEG, PNG, WebP.');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size is too large. Maximum size is 5MB.');
      return;
    }

    setUploadError('');
    setPrimaryFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPrimaryPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];

    for (const file of files) {
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        setUploadError('One of the files has an invalid type. Supported formats: JPG, JPEG, PNG, WebP.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('One of the files is too large. Maximum size is 5MB.');
        continue;
      }
      validFiles.push(file);
    }

    setUploadError('');
    setNewGalleryFiles(prev => [...prev, ...validFiles]);

    // Generate previews for newly added valid files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGalleryPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Creations Management State
  const [creations, setCreations] = useState<any[]>([]);
  const [creationsLoading, setCreationsLoading] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<any | null>(null);
  const [isEditingCreation, setIsEditingCreation] = useState(false);
  const [isAddingCreation, setIsAddingCreation] = useState(false);

  // Form attributes for Creation
  const [creationImageUrl, setCreationImageUrl] = useState('');
  const [creationPublicId, setCreationPublicId] = useState('');
  const [creationAspectRatio, setCreationAspectRatio] = useState('aspect-[1/1]');
  const [creationActive, setCreationActive] = useState(true);

  // File upload states for Creations
  const [creationFile, setCreationFile] = useState<File | null>(null);
  const [creationPreview, setCreationPreview] = useState('');
  const [creationUploadError, setCreationUploadError] = useState('');

  // Form submission feedback
  const [submittingCreation, setSubmittingCreation] = useState(false);
  const [creationResponseError, setCreationResponseError] = useState('');
  const [creationResponseSuccess, setCreationResponseSuccess] = useState(false);
  const [saveSuccessCreationButton, setSaveSuccessCreationButton] = useState(false);

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [contactMessagesLoading, setContactMessagesLoading] = useState(false);
  const [selectedContactMessage, setSelectedContactMessage] = useState<any | null>(null);
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [contactActionLoading, setContactActionLoading] = useState(false);
  const [contactActionSuccess, setContactActionSuccess] = useState('');
  const [contactActionError, setContactActionError] = useState('');

  const fetchContactMessages = async () => {
    setContactMessagesLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'contacts'));
      const fetched: any[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });

      fetched.sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val === 'number') return val;
          if (val.seconds) return val.seconds * 1000;
          if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
          const parsed = new Date(val).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };
        const timeA = getTime(a.createdAt || a.timestamp);
        const timeB = getTime(b.createdAt || b.timestamp);
        return timeB - timeA;
      });

      setContactMessages(fetched);
    } catch (err) {
      console.error('Error fetching contact messages list:', err);
    } finally {
      setContactMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'contacts' && adminUser && isAdmin) {
      fetchContactMessages();
    }
  }, [activeTab, adminUser, isAdmin]);

  const handleToggleContactMessageStatus = async (msg: any) => {
    const currentStatus = (msg.status || 'unread').toLowerCase();
    const newStatus = currentStatus === 'read' ? 'unread' : 'read';

    setContactActionLoading(true);
    setContactActionError('');
    setContactActionSuccess('');

    try {
      const docRef = doc(db, 'contacts', msg.id);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      setContactActionSuccess(`Message marked as ${newStatus}.`);
      setTimeout(() => setContactActionSuccess(''), 3000);

      setContactMessages((prev) =>
        prev.map((item) => (item.id === msg.id ? { ...item, status: newStatus } : item))
      );

      if (selectedContactMessage?.id === msg.id) {
        setSelectedContactMessage((prev: any) => ({ ...prev, status: newStatus }));
      }

      const contactsSnap = await getDocs(collection(db, 'contacts'));
      setStats((prev) => ({ ...prev, contactMessages: contactsSnap.size }));
    } catch (err: any) {
      console.error('Error updating message status:', err);
      setContactActionError('Unable to update message status. Please try again.');
    } finally {
      setContactActionLoading(false);
    }
  };

  const handleDeleteContactMessage = async (msgId: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) {
      return;
    }

    setContactActionLoading(true);
    setContactActionError('');
    setContactActionSuccess('');

    try {
      await deleteDoc(doc(db, 'contacts', msgId));

      setContactActionSuccess('Message deleted successfully.');
      setTimeout(() => setContactActionSuccess(''), 3000);

      setContactMessages((prev) => prev.filter((item) => item.id !== msgId));

      if (selectedContactMessage?.id === msgId) {
        setSelectedContactMessage(null);
      }

      const contactsSnap = await getDocs(collection(db, 'contacts'));
      setStats((prev) => ({ ...prev, contactMessages: contactsSnap.size }));
    } catch (err: any) {
      console.error('Error deleting contact message:', err);
      setContactActionError('Unable to delete contact message. Please try again.');
    } finally {
      setContactActionLoading(false);
    }
  };

  const formatMessageDate = (val: any) => {
    if (!val) return 'N/A';
    try {
      let dateObj: Date | null = null;
      if (val?.toDate && typeof val.toDate === 'function') {
        dateObj = val.toDate();
      } else if (val?.seconds) {
        dateObj = new Date(val.seconds * 1000);
      } else if (typeof val === 'string' || typeof val === 'number') {
        dateObj = new Date(val);
      }
      if (dateObj && !isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch (e) {
      // fallback
    }
    return String(val);
  };

  const fetchCreations = async () => {
    setCreationsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'creations'));
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side by createdAt desc
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setCreations(fetched);
    } catch (err) {
      console.error('Error fetching creations list:', err);
    } finally {
      setCreationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'creations' && adminUser && isAdmin) {
      fetchCreations();
    }
  }, [activeTab, adminUser, isAdmin]);

  // Sync form inputs when editing or adding a creation
  useEffect(() => {
    setCreationFile(null);
    setCreationPreview('');
    setCreationUploadError('');

    if (selectedCreation && isEditingCreation) {
      setCreationImageUrl(selectedCreation.imageUrl || selectedCreation.image || '');
      setCreationPublicId(selectedCreation.publicId || '');
      setCreationAspectRatio(selectedCreation.aspectRatio || 'aspect-[1/1]');
      setCreationActive(selectedCreation.active !== false);
      setCreationResponseError('');
      setCreationResponseSuccess(false);
    } else if (isAddingCreation) {
      setCreationImageUrl('');
      setCreationPublicId('');
      setCreationAspectRatio('aspect-[1/1]');
      setCreationActive(true);
      setCreationResponseError('');
      setCreationResponseSuccess(false);
    }
  }, [selectedCreation, isEditingCreation, isAddingCreation]);

  const handleSaveCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreation(true);
    setCreationResponseError('');
    setCreationResponseSuccess(false);

    try {
      // 1. Get or generate doc ID
      let creationId = selectedCreation?.id;
      if (!creationId) {
        const newDocRef = doc(collection(db, 'creations'));
        creationId = newDocRef.id;
      }

      // 2. Upload creationFile to Cloudinary if selected
      let finalImageUrl = creationImageUrl;
      let finalPublicId = creationPublicId;

      if (creationFile) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dycqf6xbh';
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'queens-bakery';

        // Show uploading state
        setCreationUploadError('Uploading image...');

        const formData = new FormData();
        formData.append('file', creationFile);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'creations');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('Image upload failed.');
        }

        const data = await res.json();
        const uploadedUrl = data.secure_url;
        const uploadedPublicId = data.public_id;

        // If replacing an existing image, delete the old one from Cloudinary securely via server-side API route
        if (creationPublicId) {
          try {
            await fetch('/api/admin/delete-cloudinary-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ publicId: creationPublicId })
            });
          } catch (delErr) {
            console.error('Failed to delete old Cloudinary image:', delErr);
          }
        }

        finalImageUrl = uploadedUrl;
        finalPublicId = uploadedPublicId;
        setCreationUploadError('');
      }

      if (!finalImageUrl && !creationFile) {
        throw new Error('A creation image file is required.');
      }

      // 3. Save creation payload using setDoc
      const creationPayload = {
        imageUrl: finalImageUrl,
        publicId: finalPublicId,
        aspectRatio: creationAspectRatio,
        active: creationActive,
        createdAt: selectedCreation?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'creations', creationId), creationPayload);

      await fetchCreations();

      // Reset selection files
      setCreationFile(null);
      setCreationPreview('');
      setCreationImageUrl(finalImageUrl);
      setCreationPublicId(finalPublicId);

      setCreationResponseSuccess(true);
      setSaveSuccessCreationButton(true);

      setTimeout(() => {
        setSaveSuccessCreationButton(false);
        if (!isEditingCreation) {
          setCreationImageUrl('');
          setCreationPublicId('');
          setCreationAspectRatio('aspect-[1/1]');
          setCreationActive(true);
        }
      }, 2500);

    } catch (err: any) {
      console.error('Error saving creation:', err);
      // Differentiate image upload error
      if (err.message === 'Image upload failed.') {
        setCreationUploadError('Image upload failed.');
      } else {
        setCreationResponseError(err.message || 'Unable to save creation. Please try again.');
      }
    } finally {
      setSubmittingCreation(false);
    }
  };

  const handleDeleteCreation = async (creationId: string, publicId?: string) => {
    if (!window.confirm('Are you sure you want to delete this creation image? This action cannot be undone.')) {
      return;
    }

    try {
      // 1. Delete Firestore Document
      await deleteDoc(doc(db, 'creations', creationId));
      
      // 2. Delete asset from Cloudinary securely via server-side API route
      if (publicId) {
        try {
          await fetch('/api/admin/delete-cloudinary-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId })
          });
        } catch (delErr) {
          console.error('Failed to delete Cloudinary image:', delErr);
        }
      }

      await fetchCreations();
      if (selectedCreation && selectedCreation.id === creationId) {
        setSelectedCreation(null);
        setIsEditingCreation(false);
      }
    } catch (err) {
      console.error('Error deleting creation:', err);
      alert('Unable to delete creation. Please check permissions.');
    }
  };

  const handleCreationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setCreationUploadError('Invalid file type. Supported formats: JPG, JPEG, PNG, WebP.');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCreationUploadError('File size is too large. Maximum size is 5MB.');
      return;
    }

    setCreationUploadError('');
    setCreationFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCreationPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Redirection guard
  useEffect(() => {
    if (!loading && (!adminUser || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [adminUser, isAdmin, loading, router]);

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'inquiries'));
      const fetched: any[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });

      // Sort client-side by createdAt desc
      fetched.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setInquiries(fetched);
    } catch (err) {
      console.error('Error fetching inquiries list:', err);
    } finally {
      setInquiriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inquiries' && adminUser && isAdmin) {
      fetchInquiries();
    }
  }, [activeTab, adminUser, isAdmin]);

  // Sync details fields when an inquiry is selected
  useEffect(() => {
    if (selectedInquiry) {
      setQuotedPrice(selectedInquiry.quotedPrice || '');
      setAvailability(selectedInquiry.availability || 'Available');
      setAdminMessage(selectedInquiry.adminMessage || '');
      setInquiryStatus(selectedInquiry.status || 'pending');
      setResponseError('');
      setResponseSuccess(false);
    }
  }, [selectedInquiry]);

  const handleUpdateResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setSubmittingResponse(true);
    setResponseError('');
    setResponseSuccess(false);

    try {
      const docRef = doc(db, 'inquiries', selectedInquiry.id);
      
      const updateData = {
        status: inquiryStatus,
        quotedPrice: quotedPrice || null,
        availability: availability,
        adminMessage: adminMessage || null,
        respondedAt: serverTimestamp(),
      };

      await updateDoc(docRef, updateData);

      // Trigger customer notification
      if (selectedInquiry.userId) {
        const titleStr = inquiryStatus === 'confirmed'
          ? '🎉 Inquiry Confirmed by Bakery!'
          : inquiryStatus === 'declined' || inquiryStatus === 'cancelled'
          ? 'Inquiry Status: Closed / Declined'
          : quotedPrice
          ? `🎂 Price Quote: LKR ${Number(quotedPrice).toLocaleString()}`
          : `Inquiry Status: ${inquiryStatus.replace('_', ' ').toUpperCase()}`;

        const msgStr = adminMessage.trim()
          ? (quotedPrice ? `Quote LKR ${Number(quotedPrice).toLocaleString()}: ${adminMessage.trim()}` : adminMessage.trim())
          : `Your inquiry status has been updated to ${inquiryStatus.replace('_', ' ')}.`;

        await createCustomerNotification({
          userId: selectedInquiry.userId,
          title: titleStr,
          message: msgStr,
          targetType: 'inquiries',
          targetId: selectedInquiry.id,
          status: inquiryStatus,
        });
      }

      if (adminMessage.trim() || quotedPrice) {
        await logCustomerReply({
          inquiryId: selectedInquiry.id,
          customerId: selectedInquiry.userId || '',
          customerEmail: selectedInquiry.email || '',
          customerName: selectedInquiry.name || selectedInquiry.fullName || '',
          staffUserId: adminUser?.uid || '',
          staffName: adminProfile?.name || 'Staff Member',
          staffEmail: adminUser?.email || '',
          staffRole: adminProfile?.role || 'super_admin',
          message: adminMessage.trim() ? `Quote LKR ${quotedPrice || 0}: ${adminMessage}` : `Quote: LKR ${quotedPrice || 0}`,
          status: inquiryStatus,
        });
      } else {
        await recordAudit(
          `Updated Inquiry status to "${inquiryStatus}" for ${selectedInquiry.name || selectedInquiry.fullName || 'Customer'}`,
          'customer_reply',
          'inquiries',
          selectedInquiry.id
        );
      }

      // Re-fetch list to sync counts/status
      await fetchInquiries();

      // Update selected inquiry state locally
      setSelectedInquiry((prev: any) => ({
        ...prev,
        ...updateData,
        respondedAt: { toDate: () => new Date() } // temporary local timestamp display
      }));

      // Re-fetch overview stats as well to sync counts
      const overviewStats = async () => {
        try {
          const pendingSnap = await getDocs(
            query(collection(db, 'inquiries'), where('status', '==', 'pending'))
          );
          setStats(prev => ({
            ...prev,
            pendingInquiries: pendingSnap.size
          }));
        } catch (err) {
          console.error(err);
        }
      };
      overviewStats();

      setResponseSuccess(true);
      setSaveSuccessButton(true);
      setTimeout(() => {
        setSaveSuccessButton(false);
      }, 2500);
    } catch (err: any) {
      console.error('Error updating inquiry response:', err);
      setResponseError('Unable to save response. Please try again.');
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Retrieve stats counts on page load
  useEffect(() => {
    if (!adminUser || !isAdmin) return;

    const fetchStats = async () => {
      const errors: string[] = [];
      const newStats: SummaryStats = {
        totalInquiries: 'N/A',
        pendingInquiries: 'N/A',
        customOrders: 'N/A',
        contactMessages: 'N/A'
      };

      // 1. Fetch Total Inquiries
      try {
        const inquiriesSnap = await getDocs(collection(db, 'inquiries'));
        newStats.totalInquiries = inquiriesSnap.size;
      } catch (err: any) {
        console.error('Error reading inquiries collection:', err);
        newStats.totalInquiries = 'Locked';
        errors.push('Read permission blocked for collection: "inquiries".');
      }

      // 2. Fetch Pending Inquiries
      try {
        const pendingSnap = await getDocs(
          query(collection(db, 'inquiries'), where('status', '==', 'pending'))
        );
        newStats.pendingInquiries = pendingSnap.size;
      } catch (err: any) {
        console.error('Error reading pending inquiries:', err);
        newStats.pendingInquiries = 'Locked';
        if (!errors.includes('Read permission blocked for collection: "inquiries".')) {
          errors.push('Read permission blocked for pending queries inside: "inquiries".');
        }
      }

      // 3. Fetch Custom Orders
      try {
        const customSnap = await getDocs(collection(db, 'customOrders'));
        newStats.customOrders = customSnap.size;
      } catch (err: any) {
        console.error('Error reading customOrders collection:', err);
        newStats.customOrders = 'Locked';
        errors.push('Read permission blocked for collection: "customOrders".');
      }

      // 4. Fetch Contact Messages
      try {
        const contactsSnap = await getDocs(collection(db, 'contacts'));
        newStats.contactMessages = contactsSnap.size;
      } catch (err: any) {
        console.error('Error reading contacts collection:', err);
        newStats.contactMessages = 'Locked';
        errors.push('Read permission blocked for collection: "contacts".');
      }

      setStats(newStats);
      setErrorDetails(errors);
    };

    fetchStats();
  }, [adminUser, isAdmin]);

  const handleLogout = async () => {
    try {
      await adminLogout();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !adminUser || !isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase animate-pulse">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans min-w-0 max-w-full overflow-x-hidden">
      
      {/* Mobile Top Navigation Bar (lg:hidden) */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminMobileMenuOpen(!isAdminMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 border border-slate-700/60"
            aria-label="Toggle Admin Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Logo heightClass="h-8" />
        </div>
        <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
          {activeTab}
        </span>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isAdminMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsAdminMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isAdminMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setIsAdminMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {hasPermission('viewDashboard') && (
            <button
              onClick={() => switchTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              📊 Dashboard
            </button>
          )}
          
          {hasPermission('viewInquiries') && (
            <button
              onClick={() => switchTab('inquiries')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'inquiries'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              📋 Inquiries
            </button>
          )}

          {hasPermission('viewOrders') && (
            <button
              onClick={() => switchTab('customOrders')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'customOrders'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              🎂 Custom Orders
            </button>
          )}

          {hasPermission('manageProducts') && (
            <button
              onClick={() => switchTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              🍰 Products
            </button>
          )}

          {hasPermission('manageCategories') && (
            <button
              onClick={() => switchTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'categories'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              🏷️ Categories
            </button>
          )}

          {hasPermission('manageCreations') && (
            <button
              onClick={() => switchTab('creations')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'creations'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              🖼️ Our Creations
            </button>
          )}

          {hasPermission('viewContacts') && (
            <button
              onClick={() => switchTab('contacts')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'contacts'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              ✉️ Contact Messages
            </button>
          )}

          {hasPermission('manageSettings') && (
            <button
              onClick={() => switchTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'settings'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              🌐 Social Media Links
            </button>
          )}

          {hasPermission('manageStaff') && (
            <button
              onClick={() => switchTab('staff')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'staff'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              👥 Staff Management
            </button>
          )}

          {hasPermission('viewAuditLogs') && (
            <button
              onClick={() => switchTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors duration-200 text-left ${
                activeTab === 'audit'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              📜 Audit Logs
            </button>
          )}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-2 py-1 space-y-1">
            <p className="text-xs font-bold text-white truncate">
              {adminProfile?.name || adminUser?.email || 'Admin User'}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {getRoleLabel(adminProfile?.role || 'super_admin')}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 transition-all duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex h-16 border-b border-slate-800 bg-slate-900/50 items-center justify-between px-8">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            System Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium font-mono">
              Admin Session: {adminUser.email}
            </span>
          </div>
        </header>

        {/* Dash Container */}
        <div className="p-4 md:p-8 flex-grow space-y-8 overflow-y-auto max-w-full min-w-0">
          
          {activeTab === 'dashboard' && (
            <>
              <div className="space-y-1">
                <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                  Overview Statistics
                </h1>
                <p className="text-xs text-slate-400">
                  Real-time summary counts retrieved directly from Firestore collections
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Inquiries */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Total Inquiries
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-white font-mono">
                      {stats.totalInquiries}
                    </span>
                    <span className="text-xs text-slate-400">In inquiries</span>
                  </div>
                </div>

                {/* Pending Inquiries */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                    Pending Inquiries
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-amber-400 font-mono">
                      {stats.pendingInquiries}
                    </span>
                    <span className="text-xs text-amber-500/80">Require review</span>
                  </div>
                </div>

                {/* Custom Orders */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Custom Orders
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-white font-mono">
                      {stats.customOrders}
                    </span>
                    <span className="text-xs text-slate-400">In customOrders</span>
                  </div>
                </div>

                {/* Contact Messages */}
                <div
                  onClick={() => {
                    setActiveTab('contacts');
                    setSelectedContactMessage(null);
                  }}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Contact Messages
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-white font-mono">
                      {stats.contactMessages}
                    </span>
                    <span className="text-xs text-slate-400">In contacts</span>
                  </div>
                </div>

              </div>

              {/* Database Permissions warnings helper */}
              {errorDetails.length > 0 && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    ⚠️ Firestore Database Read Notice
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Some statistic lookups were blocked. This is expected because your Firestore Security Rules may not allow admin queries yet. Publish the proposed rules to authorize the admin dashboard.
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    {errorDetails.map((detail, idx) => (
                      <li key={idx} className="text-xs text-amber-300 font-mono font-medium">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guidelines Block */}
              <div className="border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-white">
                  Queen's Bakery Administrative Controls
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  This admin area allows baking staff and coordinators to manage price availability requests, customize celebration cake requests, and follow up with Negombo delivery area coordinates. Please use discretion when reading customer profile details.
                </p>
              </div>
            </>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              {!selectedInquiry ? (
                <>
                  <div className="space-y-1">
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                      Customer Inquiries
                    </h1>
                    <p className="text-xs text-slate-400">
                      Manage customer price & availability requests
                    </p>
                  </div>

                  {inquiriesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider">
                        Loading Inquiries...
                      </span>
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
                      No customer inquiries submitted yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 bg-slate-900">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Delivery Date</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Items Count</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {inquiries.map((inq) => {
                            return (
                              <tr key={inq.id} className="hover:bg-slate-800/20">
                                <td className="p-4">
                                  <span className="font-bold text-white block">{inq.customerName}</span>
                                  <span className="text-[10px] text-slate-400 block">{inq.customerEmail}</span>
                                  <span className="text-[10px] text-slate-400 block">{inq.mobile}</span>
                                </td>
                                <td className="p-4 text-slate-300 font-semibold">{inq.requestedDate || 'N/A'}</td>
                                <td className="p-4 text-slate-300">{inq.deliveryLocation || 'N/A'}</td>
                                <td className="p-4 text-slate-300">{inq.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0} items</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                    inq.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : inq.status === 'reviewing'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : inq.status === 'quoted'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : inq.status === 'confirmed'
                                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                      : inq.status === 'completed'
                                      ? 'bg-slate-800/40 text-slate-300 border-slate-700/50'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {inq.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {(inq.status === 'pending' || inq.status === 'reviewing') && hasPermission('replyInquiries') && (
                                      <>
                                        <button
                                          onClick={() => setOrderActionModal({ isOpen: true, action: 'confirm', itemType: 'inquiry', item: inq })}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 transition-opacity"
                                        >
                                          Confirm Order
                                        </button>
                                        <button
                                          onClick={() => setOrderActionModal({ isOpen: true, action: 'reject', itemType: 'inquiry', item: inq })}
                                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2.5 py-1.5 transition-opacity"
                                        >
                                          Reject Order
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => setSelectedInquiry(inq)}
                                      className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 hover:opacity-90 transition-opacity"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Header Detail */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <button
                      onClick={() => setSelectedInquiry(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      ← Back to Inquiries List
                    </button>
                    <div className="text-xs text-slate-400 font-mono">
                      Inquiry ID: {selectedInquiry.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left side details */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Name</span>
                            <span className="text-white font-medium">{selectedInquiry.customerName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Email</span>
                            <span className="text-white font-medium">{selectedInquiry.customerEmail}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Mobile Phone</span>
                            <span className="text-white font-medium">{selectedInquiry.mobile}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">WhatsApp</span>
                            <span className="text-white font-medium">{selectedInquiry.whatsapp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                          Requested Delivery / Pickup
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Date</span>
                            <span className="text-white font-semibold">{selectedInquiry.requestedDate || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Location</span>
                            <span className="text-white font-semibold">{selectedInquiry.deliveryLocation || 'N/A'}</span>
                          </div>
                        </div>
                        {selectedInquiry.notes && (
                          <div className="pt-2 text-xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Special Instructions</span>
                            <p className="bg-slate-955 p-3 text-slate-300 border border-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                              {selectedInquiry.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                          Selected Items
                        </h3>
                        <div className="divide-y divide-slate-800">
                          {selectedInquiry.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start">
                              <div className="w-12 h-12 bg-slate-950 border border-slate-800 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-grow space-y-1 text-xs">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-white">{item.name}</h4>
                                  <span className="font-semibold text-slate-400">x{item.quantity}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-light">{item.category}</p>
                                
                                {/* Item configurations */}
                                {(item.size || item.flavour || item.message || item.style) && (
                                  <div className="flex flex-wrap gap-x-2 gap-y-1 pt-1">
                                    {item.size && (
                                      <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 text-slate-300 font-medium">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {item.flavour && (
                                      <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 text-slate-300 font-medium">
                                        Flavour: {item.flavour}
                                      </span>
                                    )}
                                    {item.style && (
                                      <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 text-slate-300 font-medium">
                                        Style: {item.style}
                                      </span>
                                    )}
                                    {item.message && (
                                      <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.5 text-slate-400 italic block w-full">
                                        Message: "{item.message}"
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right side form */}
                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Quotation & Availability Update
                      </h3>

                      <form onSubmit={handleUpdateResponse} className="space-y-4">
                        {responseError && (
                          <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
                            ⚠️ {responseError}
                          </div>
                        )}



                        {/* Status field */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="response-status" className="text-xs font-semibold text-slate-300">
                            Inquiry Status
                          </label>
                          <select
                            id="response-status"
                            value={inquiryStatus}
                            onChange={(e) => setInquiryStatus(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-900 text-white px-4 py-3 text-xs focus:outline-none focus:border-primary [&_option]:bg-slate-900 [&_option]:text-slate-100"
                          >
                            <option value="pending" className="bg-slate-900 text-slate-100">Pending</option>
                            <option value="reviewing" className="bg-slate-900 text-slate-100">Reviewing</option>
                            <option value="quoted" className="bg-slate-900 text-slate-100">Quoted</option>
                            <option value="confirmed" className="bg-slate-900 text-slate-100">Confirmed</option>
                            <option value="completed" className="bg-slate-900 text-slate-100">Completed</option>
                            <option value="cancelled" className="bg-slate-900 text-slate-100">Cancelled</option>
                          </select>
                        </div>

                        {/* Quoted Price */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="response-price" className="text-xs font-semibold text-slate-300">
                            Quoted Price (e.g. LKR 4,500.00)
                          </label>
                          <input
                            id="response-price"
                            type="text"
                            placeholder="Not Quoted"
                            value={quotedPrice}
                            onChange={(e) => setQuotedPrice(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Availability */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="response-avail" className="text-xs font-semibold text-slate-300">
                            Availability Status
                          </label>
                          <select
                            id="response-avail"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-900 text-white px-4 py-3 text-xs focus:outline-none focus:border-primary [&_option]:bg-slate-900 [&_option]:text-slate-100"
                          >
                            <option value="Available" className="bg-slate-900 text-slate-100">Available</option>
                            <option value="Unavailable" className="bg-slate-900 text-slate-100">Unavailable</option>
                            <option value="Need Discussion" className="bg-slate-900 text-slate-100">Need Discussion</option>
                          </select>
                        </div>

                        {/* Admin Message */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="response-message" className="text-xs font-semibold text-slate-300">
                            Bakery Notes / Message to Customer
                          </label>
                          <textarea
                            id="response-message"
                            rows={4}
                            placeholder="Type a message to the customer regarding availability, customizations, or delivery coordination..."
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary resize-none"
                          />
                        </div>

                        {responseSuccess && (
                          <div className="text-xs text-emerald-400 font-semibold text-center mb-3 animate-in fade-in duration-200">
                            Response saved successfully.
                          </div>
                        )}

                        {/* Submit Response */}
                        <button
                          type="submit"
                          disabled={submittingResponse}
                          className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {submittingResponse ? (
                            <span>Saving...</span>
                          ) : saveSuccessButton ? (
                            <span>Saved ✓</span>
                          ) : (
                            <span>Send / Update Response</span>
                          )}
                        </button>

                      </form>

                      {/* Display response status metadata */}
                      {selectedInquiry.respondedAt && (
                        <div className="text-[10px] text-slate-500 font-mono text-center pt-2">
                          Last Responded On: {formatTimestamp(selectedInquiry.respondedAt)}
                        </div>
                      )}

                      {/* Staff Communication Audit Trail Timeline */}
                      <div className="border-t border-slate-800 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <span>💬 Staff Communication Trail</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 font-normal">
                              {recordCommunicationHistory.length} messages
                            </span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => loadRecordCommunication(selectedInquiry.id)}
                            className="text-[11px] text-primary hover:underline font-semibold"
                          >
                            Refresh
                          </button>
                        </div>

                        {loadingCommunicationHistory ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            Loading communication history...
                          </div>
                        ) : recordCommunicationHistory.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 bg-slate-950 border border-slate-800">
                            No staff replies recorded yet for this inquiry.
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {recordCommunicationHistory.map((rep) => (
                              <div key={rep.id || Math.random()} className="bg-slate-950 border border-slate-800 p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-white">{rep.staffName}</span>
                                    <span className="text-[10px] text-slate-400">({rep.staffEmail})</span>
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-primary border border-slate-700">
                                      {getRoleLabel(rep.staffRole)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {rep.timestamp?.toDate
                                      ? rep.timestamp.toDate().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                                      : 'Just now'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                  {rep.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customOrders' && (
            <div className="space-y-6">
              {!selectedCustomOrder ? (
                <>
                  <div className="space-y-1">
                    <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                      Custom Order Requests
                    </h1>
                    <p className="text-xs text-slate-400">
                      Manage bespoke customer cake designs, bouquets, and party customizations
                    </p>
                  </div>

                  {customOrdersLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider">
                        Loading Custom Orders...
                      </span>
                    </div>
                  ) : customOrders.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
                      No custom orders submitted yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 bg-slate-900">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Requested Date</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Submitted Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {customOrders.map((order) => {
                            const dateStr = order.createdAt?.seconds 
                              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                              : 'N/A';
                            return (
                              <tr key={order.id} className="hover:bg-slate-800/20">
                                <td className="p-4">
                                  <span className="font-bold text-white block">{order.customerName}</span>
                                  <span className="text-[10px] text-slate-400 block">{order.customerEmail}</span>
                                  <span className="text-[10px] text-slate-400 block">{order.mobile}</span>
                                </td>
                                <td className="p-4 text-slate-300 font-semibold">{order.requestedDate || 'N/A'}</td>
                                <td className="p-4 text-slate-300">{order.deliveryLocation || 'N/A'}</td>
                                <td className="p-4 text-slate-400 font-mono">{dateStr}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                                    order.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : order.status === 'reviewing'
                                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      : order.status === 'accepted'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : order.status === 'in progress'
                                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                      : order.status === 'completed'
                                      ? 'bg-slate-800/40 text-slate-300 border-slate-700/50'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {(order.status === 'pending' || order.status === 'reviewing') && hasPermission('manageOrders') && (
                                      <>
                                        <button
                                          onClick={() => setOrderActionModal({ isOpen: true, action: 'confirm', itemType: 'customOrder', item: order })}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 transition-opacity"
                                        >
                                          Confirm Order
                                        </button>
                                        <button
                                          onClick={() => setOrderActionModal({ isOpen: true, action: 'reject', itemType: 'customOrder', item: order })}
                                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2.5 py-1.5 transition-opacity"
                                        >
                                          Reject Order
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => setSelectedCustomOrder(order)}
                                      className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 hover:opacity-90 transition-opacity"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Header Detail */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <button
                      onClick={() => setSelectedCustomOrder(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      ← Back to Custom Orders List
                    </button>
                    <div className="text-xs text-slate-400 font-mono">
                      Order ID: {selectedCustomOrder.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left side details */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      
                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Name</span>
                            <span className="text-white font-medium">{selectedCustomOrder.customerName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Email</span>
                            <span className="text-white font-medium">{selectedCustomOrder.customerEmail || selectedCustomOrder.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Mobile Phone</span>
                            <span className="text-white font-medium">{selectedCustomOrder.mobile || selectedCustomOrder.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">WhatsApp</span>
                            <span className="text-white font-medium">{selectedCustomOrder.whatsapp || selectedCustomOrder.whatsappNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                          Order Customization Info
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Requested Date</span>
                            <span className="text-white font-semibold">{selectedCustomOrder.requestedDate || selectedCustomOrder.date || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Delivery/Pickup Location</span>
                            <span className="text-white font-semibold">{selectedCustomOrder.deliveryLocation || selectedCustomOrder.pickupLocation || selectedCustomOrder.location || 'N/A'}</span>
                          </div>
                        </div>
                        
                        {(selectedCustomOrder.requirements || selectedCustomOrder.notes || selectedCustomOrder.details) && (
                          <div className="pt-2 text-xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Design Requirements & Notes</span>
                            <p className="bg-slate-950 p-4 text-slate-300 border border-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                              {selectedCustomOrder.requirements || selectedCustomOrder.notes || selectedCustomOrder.details || 'N/A'}
                            </p>
                          </div>
                        )}

                        {selectedCustomOrder.referenceImage && (
                          <div className="pt-2 text-xs">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Customer Reference Image</span>
                            <div className="max-w-md bg-slate-955 border border-slate-800 p-1">
                              <img
                                src={selectedCustomOrder.referenceImage}
                                alt="Reference Design"
                                className="w-full h-auto object-cover rounded-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right side form */}
                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Custom Order Update
                      </h3>

                      <form onSubmit={handleUpdateCustomOrderResponse} className="space-y-4">
                        {customOrderResponseError && (
                          <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
                            ⚠️ {customOrderResponseError}
                          </div>
                        )}

                        {customOrderResponseSuccess && (
                          <div className="text-xs text-emerald-400 font-semibold text-center mb-3 animate-in fade-in duration-200">
                            Response saved successfully.
                          </div>
                        )}

                        {/* Status field */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="custom-order-status" className="text-xs font-semibold text-slate-300">
                            Order Status
                          </label>
                          <select
                            id="custom-order-status"
                            value={customOrderStatus}
                            onChange={(e) => setCustomOrderStatus(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-900 text-white px-4 py-3 text-xs focus:outline-none focus:border-primary [&_option]:bg-slate-900 [&_option]:text-slate-100"
                          >
                            <option value="pending" className="bg-slate-900 text-slate-100">Pending</option>
                            <option value="reviewing" className="bg-slate-900 text-slate-100">Reviewing</option>
                            <option value="accepted" className="bg-slate-900 text-slate-100">Accepted</option>
                            <option value="in progress" className="bg-slate-900 text-slate-100">In Progress</option>
                            <option value="completed" className="bg-slate-900 text-slate-100">Completed</option>
                            <option value="rejected" className="bg-slate-900 text-slate-100">Rejected</option>
                          </select>
                        </div>

                        {/* Quoted Price */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="custom-order-price" className="text-xs font-semibold text-slate-300">
                            Quoted Price (LKR)
                          </label>
                          <input
                            id="custom-order-price"
                            type="text"
                            placeholder="e.g. LKR 8,500.00"
                            value={customOrderQuotedPrice}
                            onChange={(e) => setCustomOrderQuotedPrice(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Admin Message */}
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="custom-order-message" className="text-xs font-semibold text-slate-300">
                            Bakery Notes / Message to Customer
                          </label>
                          <textarea
                            id="custom-order-message"
                            rows={5}
                            placeholder="Type details regarding price quotes, flavor coordination, design adjustments, or pick up details..."
                            value={customOrderAdminMessage}
                            onChange={(e) => setCustomOrderAdminMessage(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary resize-none"
                          />
                        </div>

                        {/* Submit Response */}
                        <button
                          type="submit"
                          disabled={submittingCustomOrderResponse}
                          className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {submittingCustomOrderResponse ? (
                            <span>Saving...</span>
                          ) : saveSuccessCustomOrderButton ? (
                            <span>Saved ✓</span>
                          ) : (
                            <span>Send / Update Response</span>
                          )}
                        </button>

                      </form>

                      {/* Display response status metadata */}
                      {(selectedCustomOrder.respondedAt || selectedCustomOrder.updatedAt) && (
                        <div className="text-[10px] text-slate-500 font-mono text-center pt-2">
                          Last Updated On: {formatTimestamp(selectedCustomOrder.respondedAt || selectedCustomOrder.updatedAt)}
                        </div>
                      )}

                      {/* Staff Communication Audit Trail Timeline */}
                      <div className="border-t border-slate-800 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <span>💬 Staff Communication Trail</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 font-normal">
                              {recordCommunicationHistory.length} messages
                            </span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => loadRecordCommunication(selectedCustomOrder.id)}
                            className="text-[11px] text-primary hover:underline font-semibold"
                          >
                            Refresh
                          </button>
                        </div>

                        {loadingCommunicationHistory ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            Loading communication history...
                          </div>
                        ) : recordCommunicationHistory.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-3 bg-slate-950 border border-slate-800">
                            No staff replies recorded yet for this custom order.
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {recordCommunicationHistory.map((rep) => (
                              <div key={rep.id || Math.random()} className="bg-slate-950 border border-slate-800 p-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-white">{rep.staffName}</span>
                                    <span className="text-[10px] text-slate-400">({rep.staffEmail})</span>
                                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-primary border border-slate-700">
                                      {getRoleLabel(rep.staffRole)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {rep.timestamp?.toDate
                                      ? rep.timestamp.toDate().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                                      : 'Just now'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                                  {rep.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {!isAddingProduct && !isEditingProduct ? (
                <>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                        Products Catalog
                      </h1>
                      <p className="text-xs text-slate-400">
                        Manage cakes, savoury platters, desserts, bouquets, and packages
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingProduct(true)}
                      className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                    >
                      ＋ Add Product
                    </button>
                  </div>

                  {productsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider">
                        Loading Products...
                      </span>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
                      No products found in Firestore "products" collection.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden relative"
                        >
                          {/* Image */}
                          <div className="aspect-square bg-slate-950 border-b border-slate-800 overflow-hidden relative">
                            <img
                              src={prod.image || '/images/placeholder.jpg'}
                              alt={prod.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                              }}
                              className="w-full h-full object-cover rounded-none"
                            />
                            
                            {/* Active status badge */}
                            <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              prod.active !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
                            }`}>
                              {prod.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                                {prod.category}
                              </span>
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {prod.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-light line-clamp-2">
                                {prod.description}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                              <button
                                onClick={() => {
                                  setSelectedProduct(prod);
                                  setIsEditingProduct(true);
                                }}
                                className="bg-slate-800 text-white text-[10px] font-bold py-2 border border-slate-800 hover:bg-slate-700 text-center transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name, prod.imagePublicId, prod.imagesPublicIds)}
                                className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[10px] font-bold py-2 text-center transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setIsEditingProduct(false);
                        setIsAddingProduct(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      ← Back to Products List
                    </button>
                    <div className="text-xs text-slate-400 font-mono">
                      {isEditingProduct ? `Editing Product: ${selectedProduct.id}` : 'Creating New Product'}
                    </div>
                  </div>

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column (Metadata) */}
                    <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Product Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label htmlFor="prod-name-field" className="text-xs font-semibold text-slate-300">
                            Product Name *
                          </label>
                          <input
                            id="prod-name-field"
                            type="text"
                            required
                            placeholder="e.g. Rainbow Drip Cake"
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Slug */}
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label htmlFor="prod-slug-field" className="text-xs font-semibold text-slate-300">
                            Product Slug (Optional - Leave blank to auto-generate)
                          </label>
                          <input
                            id="prod-slug-field"
                            type="text"
                            placeholder="e.g. rainbow-drip-cake"
                            value={prodSlug}
                            onChange={(e) => setProdSlug(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Category */}
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label htmlFor="prod-category-field" className="text-xs font-semibold text-slate-300">
                            Category *
                          </label>
                          <select
                            id="prod-category-field"
                            required
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="rounded-none border border-slate-800 bg-slate-900 text-white px-4 py-3 text-xs focus:outline-none focus:border-primary [&_option]:bg-slate-900 [&_option]:text-slate-100"
                          >
                            <option value="" disabled className="bg-slate-900 text-slate-100">
                              Select Category
                            </option>
                            {categoriesList.map((cat) => (
                              <option key={cat.id || cat.name} value={cat.name} className="bg-slate-900 text-slate-100">
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Primary Image Upload */}
                        <div className="flex flex-col gap-1.5 col-span-1">
                          <label className="text-xs font-semibold text-slate-300">
                            Primary Product Image *
                          </label>
                          
                          {(primaryPreview || prodImage) ? (
                            <div className="relative w-32 h-32 bg-slate-950 border border-slate-800 flex items-center justify-center group overflow-hidden">
                              <img
                                src={primaryPreview || prodImage}
                                alt="Primary Preview"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                                }}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPrimaryFile(null);
                                  setPrimaryPreview('');
                                  setProdImage('');
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-rose-400 transition-opacity"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full h-12 border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950 cursor-pointer relative">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                onChange={handlePrimaryImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center px-2">
                                Choose Image File
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Brief Description */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="prod-desc-field" className="text-xs font-semibold text-slate-300">
                          Brief Description * (for catalog previews)
                        </label>
                        <input
                          id="prod-desc-field"
                          type="text"
                          required
                          placeholder="Short summary of the bake..."
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Long Description */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="prod-long-desc-field" className="text-xs font-semibold text-slate-300">
                          Detailed Description * (full product details layout page)
                        </label>
                        <textarea
                          id="prod-long-desc-field"
                          rows={4}
                          required
                          placeholder="Provide flavor details, textures, ingredients notes, delivery restrictions..."
                          value={prodLongDescription}
                          onChange={(e) => setProdLongDescription(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary resize-none"
                        />
                      </div>

                      {/* Gallery Images */}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-300">
                          Gallery Images (Optional)
                        </label>

                        {/* Thumbnails grid */}
                        <div className="flex flex-wrap gap-3">
                          {/* Existing Gallery URLs */}
                          {galleryUrls.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative w-20 h-20 bg-slate-950 border border-slate-800 overflow-hidden group">
                              <img
                                src={url}
                                alt={`Gallery ${idx}`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                                }}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const pubIdToDelete = galleryPublicIds[idx];
                                  if (pubIdToDelete) {
                                    fetch('/api/admin/delete-cloudinary-image', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ publicId: pubIdToDelete })
                                    }).catch(err => console.error('Cloudinary destroy failed on item removal:', err));
                                  }
                                  setGalleryUrls(galleryUrls.filter((_, i) => i !== idx));
                                  setGalleryPublicIds(galleryPublicIds.filter((_, i) => i !== idx));
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-rose-400 transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          {/* Newly selected files */}
                          {newGalleryPreviews.map((preview, idx) => (
                            <div key={`new-${idx}`} className="relative w-20 h-20 bg-slate-950 border border-slate-800 overflow-hidden group">
                              <img
                                src={preview}
                                alt={`New Gallery ${idx}`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                                }}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== idx));
                                  setNewGalleryPreviews(newGalleryPreviews.filter((_, i) => i !== idx));
                                }}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-rose-400 transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          {/* Add button trigger */}
                          <div className="flex items-center justify-center w-20 h-20 border border-dashed border-slate-800 bg-slate-955 hover:bg-slate-950 cursor-pointer relative">
                            <input
                              type="file"
                              multiple
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handleGalleryImagesChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                              ＋ Add
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column (Options & Submit) */}
                    <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Customize Options
                      </h3>

                      {/* Sizes */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="prod-sizes-field" className="text-xs font-semibold text-slate-300">
                          Sizes (Optional - comma-separated list)
                        </label>
                        <input
                          id="prod-sizes-field"
                          type="text"
                          placeholder="e.g. 1kg, 2kg"
                          value={prodSizes}
                          onChange={(e) => setProdSizes(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Flavours */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="prod-flavours-field" className="text-xs font-semibold text-slate-300">
                          Flavours (Optional - comma-separated list)
                        </label>
                        <input
                          id="prod-flavours-field"
                          type="text"
                          placeholder="e.g. Vanilla, Chocolate, Mocha"
                          value={prodFlavours}
                          onChange={(e) => setProdFlavours(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Styles */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="prod-styles-field" className="text-xs font-semibold text-slate-300">
                          Styles / Wrapping Options (Optional - comma-separated)
                        </label>
                        <input
                          id="prod-styles-field"
                          type="text"
                          placeholder="e.g. Standard wrapping, Premium box"
                          value={prodStyles}
                          onChange={(e) => setProdStyles(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Toggle checkboxes */}
                      <div className="space-y-3 pt-2">
                        {/* Allow Custom Message */}
                        <label className="flex items-center gap-3 text-xs font-medium text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prodAllowCustomMessage}
                            onChange={(e) => setProdAllowCustomMessage(e.target.checked)}
                            className="w-4 h-4 rounded-none border-slate-800 bg-slate-955 text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none"
                          />
                          Allow Custom message on cake
                        </label>

                        {/* Active status */}
                        <label className="flex items-center gap-3 text-xs font-medium text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prodActive}
                            onChange={(e) => setProdActive(e.target.checked)}
                            className="w-4 h-4 rounded-none border-slate-800 bg-slate-955 text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none"
                          />
                          Product is Active (Visible on Storefront)
                        </label>
                      </div>

                      {/* Form responses alerts */}
                      <div className="space-y-4 pt-4 border-t border-slate-800">
                        
                        {uploadError && (
                          <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
                            ⚠️ {uploadError}
                          </div>
                        )}

                        {productResponseError && (
                          <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
                            ⚠️ {productResponseError}
                          </div>
                        )}

                        {productResponseSuccess && (
                          <div className="text-xs text-emerald-400 font-semibold text-center mb-3 animate-in fade-in duration-200">
                            Product saved successfully.
                          </div>
                        )}

                        {/* Save Actions CTA */}
                        <button
                          type="submit"
                          disabled={submittingProduct}
                          className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {submittingProduct ? (
                            <span>Saving...</span>
                          ) : saveSuccessProductButton ? (
                            <span>Saved ✓</span>
                          ) : (
                            <span>Save Product</span>
                          )}
                        </button>
                      </div>

                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'creations' && (
            <div className="space-y-6">
              {!isAddingCreation && !isEditingCreation ? (
                <>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <div className="space-y-1">
                      <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                        Creations Gallery
                      </h1>
                      <p className="text-xs text-slate-400">
                        Manage cakes, savoury platters, and desserts displayed in the masonry gallery
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingCreation(true)}
                      className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
                    >
                      ＋ Add Creation
                    </button>
                  </div>

                  {creationsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider">
                        Loading Gallery...
                      </span>
                    </div>
                  ) : creations.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
                      No creations found in Firestore "creations" collection.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {creations.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-900 border border-slate-800 flex flex-col justify-between overflow-hidden relative"
                        >
                          {/* Image preview matching aspect ratio */}
                          <div className={`w-full ${item.aspectRatio || 'aspect-[1/1]'} bg-slate-950 border-b border-slate-800 overflow-hidden relative`}>
                            <img
                              src={item.imageUrl || item.image || '/images/placeholder.jpg'}
                              alt="Queen's Bakery Creation"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                              }}
                              className="w-full h-full object-cover rounded-none"
                            />
                            
                            {/* Active status badge */}
                            <span className={`absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              item.active !== false
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
                            }`}>
                              {item.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          {/* Detail summary */}
                          <div className="p-4 flex-grow flex flex-col justify-between gap-4">
                            <div>
                              <span className="text-[10px] text-primary uppercase font-bold tracking-wider font-mono">
                                Aspect Ratio: {item.aspectRatio === 'aspect-[3/4]' ? 'Portrait 3:4' : item.aspectRatio === 'aspect-[4/3]' ? 'Landscape 4:3' : 'Square 1:1'}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                              <button
                                onClick={() => {
                                  setSelectedCreation(item);
                                  setIsEditingCreation(true);
                                }}
                                className="bg-slate-800 text-white text-[10px] font-bold py-2 border border-slate-800 hover:bg-slate-700 text-center transition-colors"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCreation(item.id, item.publicId)}
                                className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[10px] font-bold py-2 text-center transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedCreation(null);
                        setIsEditingCreation(false);
                        setIsAddingCreation(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      ← Back to Creations List
                    </button>
                    <div className="text-xs text-slate-400 font-mono">
                      {isEditingCreation ? `Editing Creation: ${selectedCreation.id}` : 'Creating New Creation'}
                    </div>
                  </div>

                  <form onSubmit={handleSaveCreation} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column (Metadata) */}
                    <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Creation Details
                      </h3>

                      {/* Creation Image File Upload */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Creation Image File *
                        </label>
                        
                        {(creationPreview || creationImageUrl) ? (
                          <div className="relative w-32 h-32 bg-slate-950 border border-slate-800 flex items-center justify-center group overflow-hidden">
                            <img
                              src={creationPreview || creationImageUrl}
                              alt="Creation Preview"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                              }}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCreationFile(null);
                                setCreationPreview('');
                                setCreationImageUrl('');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-rose-400 transition-opacity"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full h-12 border border-dashed border-slate-800 bg-slate-955 hover:bg-slate-905 cursor-pointer relative">
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg, image/webp"
                              onChange={handleCreationImageChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center px-2">
                              Choose Image File
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Aspect Ratio dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="creation-aspect-field" className="text-xs font-semibold text-slate-300">
                          Aspect Ratio *
                        </label>
                        <select
                          id="creation-aspect-field"
                          required
                          value={creationAspectRatio}
                          onChange={(e) => setCreationAspectRatio(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-900 text-white px-4 py-3 text-xs focus:outline-none focus:border-primary [&_option]:bg-slate-900 [&_option]:text-slate-100"
                        >
                          <option value="aspect-[1/1]" className="bg-slate-900 text-slate-100">Square (1:1)</option>
                          <option value="aspect-[3/4]" className="bg-slate-900 text-slate-100">Portrait (3:4)</option>
                          <option value="aspect-[4/3]" className="bg-slate-900 text-slate-100">Landscape (4:3)</option>
                        </select>
                      </div>

                      {/* Active Toggle status */}
                      <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 text-xs font-medium text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={creationActive}
                            onChange={(e) => setCreationActive(e.target.checked)}
                            className="w-4 h-4 rounded-none border-slate-800 bg-slate-955 text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none"
                          />
                          Creation is Active (Visible on Gallery)
                        </label>
                      </div>

                    </div>

                    {/* Right Column (Preview & Submit) */}
                    <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Image Preview
                      </h3>

                      {(creationPreview || creationImageUrl) ? (
                        <div className={`w-full ${creationAspectRatio} bg-slate-950 border border-slate-800 overflow-hidden relative`}>
                          <img
                            src={creationPreview || creationImageUrl}
                            alt="Preview Creation"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/fda4af?text=Queen%27s+Bakery';
                            }}
                            className="w-full h-full object-cover rounded-none"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square border border-dashed border-slate-800 bg-slate-955 flex items-center justify-center text-[10px] text-slate-650 font-bold uppercase tracking-wider">
                          No image selected
                        </div>
                      )}

                      {/* Form responses alerts */}
                      <div className="space-y-4 pt-4 border-t border-slate-800">

                        {creationUploadError && (
                          <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
                            ⚠️ {creationUploadError}
                          </div>
                        )}
                        
                        {creationResponseError && (
                          <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
                            ⚠️ {creationResponseError}
                          </div>
                        )}

                        {creationResponseSuccess && (
                          <div className="text-xs text-emerald-400 font-semibold text-center mb-3 animate-in fade-in duration-200">
                            Creation saved successfully.
                          </div>
                        )}

                        {/* Save Actions CTA */}
                        <button
                          type="submit"
                          disabled={submittingCreation}
                          className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {submittingCreation ? (
                            <span>Saving...</span>
                          ) : saveSuccessCreationButton ? (
                            <span>Saved ✓</span>
                          ) : (
                            <span>Save Creation</span>
                          )}
                        </button>
                      </div>

                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {!selectedContactMessage ? (
                <>
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                        Contact Messages
                      </h1>
                      <p className="text-xs text-slate-400">
                        Manage incoming customer messages and contact inquiries
                      </p>
                    </div>

                    <button
                      onClick={fetchContactMessages}
                      disabled={contactMessagesLoading}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${contactMessagesLoading ? 'animate-spin' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* Action feedback banners */}
                  {contactActionSuccess && (
                    <div className="rounded-none bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-semibold animate-in fade-in duration-200">
                      ✓ {contactActionSuccess}
                    </div>
                  )}
                  {contactActionError && (
                    <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 font-semibold animate-in fade-in duration-200">
                      ⚠️ {contactActionError}
                    </div>
                  )}

                  {/* Filter Pills */}
                  <div className="flex gap-2">
                    {(['all', 'unread', 'read'] as const).map((filterOpt) => (
                      <button
                        key={filterOpt}
                        onClick={() => setContactStatusFilter(filterOpt)}
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                          contactStatusFilter === filterOpt
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {filterOpt} {filterOpt === 'unread' ? `(${contactMessages.filter(m => (m.status || 'unread').toLowerCase() === 'unread').length})` : ''}
                      </button>
                    ))}
                  </div>

                  {/* Content list / Table */}
                  {contactMessagesLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
                        Loading Messages...
                      </span>
                    </div>
                  ) : contactMessages.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
                      No contact messages found in Firestore.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 bg-slate-900">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Message Snippet</th>
                            <th className="p-4">Submitted Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {contactMessages
                            .filter((msg) => {
                              const st = (msg.status || 'unread').toLowerCase();
                              if (contactStatusFilter === 'unread') return st === 'unread';
                              if (contactStatusFilter === 'read') return st === 'read';
                              return true;
                            })
                            .map((msg) => {
                              const name = msg.name || msg.customerName || msg.fullName || 'Anonymous';
                              const email = msg.email || msg.customerEmail || 'No email';
                              const phone = msg.phone || msg.mobile || msg.whatsapp || msg.phoneNumber || 'N/A';
                              const messageText = msg.message || msg.content || msg.notes || msg.subject || '(No message content)';
                              const statusStr = (msg.status || 'unread').toLowerCase();
                              const formattedDate = formatMessageDate(msg.createdAt || msg.timestamp);

                              return (
                                <tr key={msg.id} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4">
                                    <span className="font-bold text-white block">{name}</span>
                                    <span className="text-[10px] text-slate-400 block">{email}</span>
                                    <span className="text-[10px] text-slate-400 block">{phone}</span>
                                  </td>
                                  <td className="p-4 text-slate-300 max-w-xs">
                                    <p className="line-clamp-2 text-xs font-light leading-relaxed">
                                      {messageText}
                                    </p>
                                  </td>
                                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                                    {formattedDate}
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                      statusStr === 'unread'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                      {statusStr}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setSelectedContactMessage(msg)}
                                        className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 hover:opacity-90 transition-opacity"
                                      >
                                        View Details
                                      </button>
                                      <button
                                        onClick={() => handleToggleContactMessageStatus(msg)}
                                        disabled={contactActionLoading}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-3 py-1.5 transition-colors"
                                      >
                                        {statusStr === 'read' ? 'Mark Unread' : 'Mark Read'}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteContactMessage(msg.id)}
                                        disabled={contactActionLoading}
                                        className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold px-3 py-1.5 transition-colors"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                /* Message Details Sub-view */
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <button
                      onClick={() => setSelectedContactMessage(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      ← Back to Contact Messages List
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {selectedContactMessage.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Customer Info Column */}
                    <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 space-y-6">
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Customer Info
                      </h3>

                      <div className="space-y-4 text-xs">
                        <div>
                          <span className="text-slate-500 block uppercase font-bold text-[10px]">Name</span>
                          <span className="text-white font-semibold text-sm">
                            {selectedContactMessage.name || selectedContactMessage.customerName || selectedContactMessage.fullName || 'Anonymous'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block uppercase font-bold text-[10px]">Email</span>
                          <a
                            href={`mailto:${selectedContactMessage.email || selectedContactMessage.customerEmail}`}
                            className="text-primary hover:underline font-mono"
                          >
                            {selectedContactMessage.email || selectedContactMessage.customerEmail || 'N/A'}
                          </a>
                        </div>

                        <div>
                          <span className="text-slate-500 block uppercase font-bold text-[10px]">Mobile / WhatsApp</span>
                          <span className="text-slate-300 font-mono">
                            {selectedContactMessage.phone || selectedContactMessage.mobile || selectedContactMessage.whatsapp || selectedContactMessage.phoneNumber || 'N/A'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block uppercase font-bold text-[10px]">Submitted Date & Time</span>
                          <span className="text-slate-300 font-mono">
                            {formatMessageDate(selectedContactMessage.createdAt || selectedContactMessage.timestamp)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block uppercase font-bold text-[10px]">Status</span>
                          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider mt-1 ${
                            (selectedContactMessage.status || 'unread').toLowerCase() === 'unread'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {(selectedContactMessage.status || 'unread').toLowerCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions Box */}
                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        <button
                          onClick={() => handleToggleContactMessageStatus(selectedContactMessage)}
                          disabled={contactActionLoading}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-3 transition-colors text-center"
                        >
                          {(selectedContactMessage.status || 'unread').toLowerCase() === 'read' ? 'Mark as Unread' : 'Mark as Read'}
                        </button>

                        <button
                          onClick={() => handleDeleteContactMessage(selectedContactMessage.id)}
                          disabled={contactActionLoading}
                          className="w-full bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold py-3 transition-colors text-center"
                        >
                          Delete Message
                        </button>
                      </div>
                    </div>

                    {/* Message Content Column */}
                    <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 space-y-4">
                      <h3 className="font-serif text-lg font-bold text-white border-b border-slate-800 pb-2">
                        Message Content
                      </h3>

                      <div className="bg-slate-955 border border-slate-800 p-6 rounded-none min-h-[200px]">
                        <p className="text-sm font-light text-slate-200 leading-relaxed whitespace-pre-line">
                          {selectedContactMessage.message || selectedContactMessage.content || selectedContactMessage.notes || selectedContactMessage.subject || '(No message content entered)'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                    Category Management
                  </h1>
                  <p className="text-xs text-slate-400">
                    Add, edit, and manage product categories for Queen's Bakery catalog
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={loadAdminCategories}
                    disabled={categoriesLoading}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${categoriesLoading ? 'animate-spin' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleSeedDefaultCategories}
                    disabled={categoriesLoading}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 transition-colors border border-slate-700"
                    title="Seed initial categories: Cakes, Savoury Items, Desserts, Flower Bouquets, Party Packages"
                  >
                    🌱 Seed Initial Categories
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCategoryItem(null);
                      setIsEditingCategory(false);
                      setIsAddingCategory(true);
                      setCatNameInput('');
                      setCatDescInput('');
                    }}
                    className="bg-primary hover:opacity-95 text-primary-foreground text-xs font-bold px-4 py-2.5 transition-all shadow-sm"
                  >
                    + Add New Category
                  </button>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Categories Table / List */}
                <div className={`${isAddingCategory || isEditingCategory ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
                  {categoriesLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
                        Loading Categories...
                      </span>
                    </div>
                  ) : categoriesList.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
                      No categories found in Firestore. Click "+ Add New Category" to create one.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 bg-slate-900">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                            <th className="p-4">Cover Image</th>
                            <th className="p-4">Category Name</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 text-center">Products</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {categoriesList.map((cat) => {
                            const isSelected = selectedCategoryItem?.id === cat.id;
                            const productCount = products.filter(
                              (p) => normalizeCategoryName(p.category) === normalizeCategoryName(cat.name)
                            ).length;
                            const coverImg = resolveCategoryCoverImage(cat, products);

                            return (
                              <tr
                                key={cat.id}
                                className={`hover:bg-slate-800/40 transition-colors ${
                                  isSelected ? 'bg-slate-800/60' : ''
                                }`}
                              >
                                <td className="p-4">
                                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 group">
                                    <img
                                      src={coverImg}
                                      alt={cat.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      onClick={() => setCoverModalCategory(cat)}
                                      title="Change Cover Image"
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold p-1 text-center"
                                    >
                                      Change
                                    </button>
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-white">
                                  <div className="space-y-0.5">
                                    <p>{cat.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">
                                      {cat.image ? 'Explicit Cover Image' : 'Auto Product Image'}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-4 text-slate-400 max-w-xs truncate">
                                  {cat.description || '—'}
                                </td>
                                <td className="p-4 text-center">
                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-primary border border-slate-700">
                                    {productCount} products
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() => setCoverModalCategory(cat)}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] font-bold px-3 py-1.5 transition-colors"
                                  >
                                    🖼️ Cover
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCategoryItem(cat);
                                      setIsEditingCategory(true);
                                      setIsAddingCategory(false);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-3 py-1.5 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat)}
                                    className="bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold px-3 py-1.5 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Add / Edit Form Drawer */}
                {(isAddingCategory || isEditingCategory) && (
                  <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 space-y-6">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <h3 className="font-serif text-lg font-bold text-white">
                        {isEditingCategory ? 'Edit Category' : 'Add New Category'}
                      </h3>
                      <button
                        onClick={() => {
                          setIsAddingCategory(false);
                          setIsEditingCategory(false);
                          setSelectedCategoryItem(null);
                        }}
                        className="text-slate-400 hover:text-white text-xs font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {categoryResponseSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-semibold animate-in fade-in duration-200">
                        ✓ Category saved successfully!
                      </div>
                    )}

                    {categoryResponseError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-semibold animate-in fade-in duration-200">
                        ⚠️ {categoryResponseError}
                      </div>
                    )}

                    <form onSubmit={handleSaveCategory} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-name-input" className="text-xs font-semibold text-slate-300">
                          Category Name *
                        </label>
                        <input
                          id="cat-name-input"
                          type="text"
                          required
                          placeholder="e.g. Specialty Cakes"
                          value={catNameInput}
                          onChange={(e) => setCatNameInput(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-desc-input" className="text-xs font-semibold text-slate-300">
                          Description (Optional)
                        </label>
                        <textarea
                          id="cat-desc-input"
                          rows={3}
                          placeholder="Short description of this category..."
                          value={catDescInput}
                          onChange={(e) => setCatDescInput(e.target.value)}
                          className="rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary resize-none"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(false);
                            setIsEditingCategory(false);
                            setSelectedCategoryItem(null);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 transition-colors"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={submittingCategory}
                          className="bg-primary text-primary-foreground text-xs font-bold px-6 py-2.5 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                        >
                          {submittingCategory ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                              <span>Saving...</span>
                            </div>
                          ) : saveSuccessCategoryButton ? (
                            <span>Saved ✓</span>
                          ) : (
                            <span>{isEditingCategory ? 'Update Category' : 'Save Category'}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                    Social Media Links & Settings
                  </h1>
                  <p className="text-xs text-slate-400">
                    Manage public Facebook, TikTok, and WhatsApp links displayed across the Queen's Bakery website
                  </p>
                </div>

                <button
                  onClick={loadAdminSettings}
                  disabled={settingsLoading}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${settingsLoading ? 'animate-spin' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>

              {settingsSuccess && (
                <div className="rounded-none bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-semibold animate-in fade-in duration-200">
                  ✓ Social media settings updated successfully! Public website links are now updated.
                </div>
              )}

              {settingsError && (
                <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 font-semibold animate-in fade-in duration-200">
                  ⚠️ {settingsError}
                </div>
              )}

              <div className="max-w-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* Facebook URL */}
                  <div className="space-y-1.5">
                    <label htmlFor="setting-fb" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                        <path d="M9 8H7v3h2v9h4v-9h3.625L16 8h-3V7c0-.5.5-1 1-1h2V3h-3c-2.5 0-4 1.5-4 4v1z"/>
                      </svg>
                      Facebook Page / Share URL
                    </label>
                    <input
                      id="setting-fb"
                      type="text"
                      placeholder="https://www.facebook.com/your-page-link"
                      value={fbUrlInput}
                      onChange={(e) => setFbUrlInput(e.target.value)}
                      className="w-full rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave empty if you don't want to display Facebook icon on the website.
                    </p>
                  </div>

                  {/* TikTok URL */}
                  <div className="space-y-1.5">
                    <label htmlFor="setting-tt" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.82.97 1.97 1.65 3.23 1.94V10.2c-1.19-.17-2.33-.7-3.23-1.48-.68-.58-1.22-1.33-1.57-2.18v8.61c.07 2.11-.84 4.19-2.43 5.56-1.74 1.5-4.22 2.05-6.49 1.43-2.55-.7-4.54-2.88-4.99-5.5-.6-3.48 1.42-7.01 4.79-7.97.74-.21 1.52-.27 2.28-.18v4.06c-.84-.19-1.74.03-2.37.62-.73.69-.97 1.8-.57 2.72.4 1 1.48 1.62 2.54 1.46 1.13-.17 1.94-1.18 1.91-2.32V.02z"/>
                      </svg>
                      TikTok Profile URL
                    </label>
                    <input
                      id="setting-tt"
                      type="text"
                      placeholder="https://www.tiktok.com/@queensbakerysl"
                      value={ttUrlInput}
                      onChange={(e) => setTtUrlInput(e.target.value)}
                      className="w-full rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave empty if you don't want to display TikTok icon on the website.
                    </p>
                  </div>

                  {/* WhatsApp Link / Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="setting-wa" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.786 1.452 5.586 0 10.132-4.547 10.136-10.13.002-2.709-1.051-5.253-2.966-7.17C16.628 1.371 14.09.315 11.393.315c-5.592 0-10.14 4.549-10.144 10.135-.002 1.848.494 3.655 1.437 5.248L1.72 21.04l5.34-1.4a9.745 9.745 0 00-.413-.486z"/>
                      </svg>
                      WhatsApp Link or Mobile Number
                    </label>
                    <input
                      id="setting-wa"
                      type="text"
                      placeholder="https://wa.me/94770000000 or +94 77 000 0000"
                      value={waUrlInput}
                      onChange={(e) => setWaUrlInput(e.target.value)}
                      className="w-full rounded-none border border-slate-800 bg-slate-955 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-[11px] text-slate-500">
                      Enter a full wa.me link or a phone number. Numbers will be automatically converted to valid wa.me links.
                    </p>
                  </div>

                  {/* Save CTA */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingSettings}
                      className="w-full sm:w-auto bg-primary text-primary-foreground text-xs font-bold px-8 py-3.5 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                    >
                      {submittingSettings ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                          <span>Saving Settings...</span>
                        </div>
                      ) : (
                        <span>Save Social Media Links</span>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                    Staff & Admin Management
                  </h1>
                  <p className="text-xs text-slate-400">
                    Create staff accounts, assign roles, and configure granular permission access
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadStaffData}
                    disabled={staffLoading}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${staffLoading ? 'animate-spin' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleOpenAddStaff}
                    className="bg-primary hover:opacity-95 text-primary-foreground text-xs font-bold px-4 py-2.5 transition-all shadow-sm flex items-center gap-2"
                  >
                    <span>+ Add New Staff</span>
                  </button>
                </div>
              </div>

              {/* Staff List Table */}
              <div className="bg-slate-900 border border-slate-800 overflow-hidden">
                {staffLoading ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    Loading staff accounts...
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <p className="text-sm font-semibold text-slate-300">No Staff Accounts Found</p>
                    <p className="text-xs text-slate-500">
                      Click "+ Add New Staff" to create your first team member account.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4">Staff Member</th>
                          <th className="py-3.5 px-4">Role</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Last Login</th>
                          <th className="py-3.5 px-4">Permissions Access</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {staffList.map((staff) => {
                          const activePermsCount = Object.values(staff.permissions || {}).filter(Boolean).length;
                          const isSelf = staff.uid === adminUser?.uid;

                          return (
                            <tr key={staff.uid} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                                    {staff.name ? staff.name.charAt(0) : 'S'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-white flex items-center gap-2">
                                      <span>{staff.name}</span>
                                      {isSelf && (
                                        <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 font-bold uppercase">
                                          You
                                        </span>
                                      )}
                                    </p>
                                    <p className="text-[11px] text-slate-400">{staff.email}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <span
                                  className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-none ${
                                    staff.role === 'super_admin'
                                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                      : staff.role === 'order_manager'
                                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                      : staff.role === 'customer_support'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}
                                >
                                  {getRoleLabel(staff.role)}
                                </span>
                              </td>

                              <td className="py-4 px-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                                    staff.active ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${staff.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  <span>{staff.active ? 'Active' : 'Deactivated'}</span>
                                </span>
                              </td>

                              <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                                {staff.lastLogin?.toDate
                                  ? staff.lastLogin.toDate().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                                  : 'Never'}
                              </td>

                              <td className="py-4 px-4">
                                <span className="text-xs text-slate-400">
                                  {staff.role === 'super_admin'
                                    ? 'Full Access (13/13)'
                                    : `${activePermsCount} / 13 Enabled`}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditStaff(staff)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 transition-colors border border-slate-700"
                                  >
                                    Edit Role & Perms
                                  </button>

                                  <button
                                    onClick={() => handleResetStaffPasswordAction(staff)}
                                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 transition-colors border border-slate-800"
                                    title="Send password reset link to staff email"
                                  >
                                    🔑 Reset Password
                                  </button>

                                  {!isSelf && (
                                    <>
                                      <button
                                        onClick={() => handleToggleStaffActive(staff)}
                                        className={`text-xs font-semibold px-3 py-1.5 transition-colors border ${
                                          staff.active
                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                        }`}
                                      >
                                        {staff.active ? 'Deactivate' : 'Activate'}
                                      </button>

                                      <button
                                        onClick={() => handleDeleteStaffMember(staff)}
                                        className="bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-xs font-semibold px-3 py-1.5 transition-colors border border-slate-800 hover:border-rose-900"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Drawer Modal for Add / Edit Staff */}
              {(isAddingStaff || isEditingStaff) && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
                  <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl">
                    
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-white">
                          {isAddingStaff ? 'Add New Staff Member' : 'Edit Staff Role & Permissions'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {isAddingStaff
                            ? 'Create a new Firebase Auth staff login and configure permission access.'
                            : `Update role and granular permissions for ${staffNameInput || 'staff member'}.`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsAddingStaff(false);
                          setIsEditingStaff(false);
                          setSelectedStaff(null);
                        }}
                        className="text-slate-400 hover:text-white p-2 text-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {staffResponseSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-semibold">
                        ✓ Staff account saved successfully!
                      </div>
                    )}

                    {staffResponseError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 font-semibold">
                        ⚠️ {staffResponseError}
                      </div>
                    )}

                    <form onSubmit={handleSaveStaff} className="space-y-6">
                      
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Staff Member Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ruwan Perera"
                          value={staffNameInput}
                          onChange={(e) => setStaffNameInput(e.target.value)}
                          className="w-full border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Email Address (Login Username) *</label>
                        <input
                          type="email"
                          required
                          disabled={isEditingStaff}
                          placeholder="staff@queensbakery.lk"
                          value={staffEmailInput}
                          onChange={(e) => setStaffEmailInput(e.target.value)}
                          className="w-full border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                      </div>

                      {/* Password (Only when adding staff) */}
                      {isAddingStaff && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Initial Login Password *</label>
                          <input
                            type="password"
                            required
                            placeholder="At least 6 characters"
                            value={staffPasswordInput}
                            onChange={(e) => setStaffPasswordInput(e.target.value)}
                            className="w-full border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}

                      {/* Role Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Assign Role Preset</label>
                        <select
                          value={staffRoleInput}
                          onChange={(e) => handleRoleSelectChange(e.target.value as StaffRole)}
                          className="w-full border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-primary [&_option]:bg-slate-900 [&_option]:text-slate-100"
                        >
                          <option value="super_admin">Super Admin / Main Admin (Full Access)</option>
                          <option value="order_manager">Order Manager (Orders & Inquiries)</option>
                          <option value="customer_support">Customer Support (Inquiries, Contacts)</option>
                          <option value="content_manager">Content Manager (Products, Categories, Gallery, Links)</option>
                        </select>
                        <p className="text-[11px] text-slate-500">
                          Selecting a role automatically sets standard permissions below. You can also customize individual permission checkmarks.
                        </p>
                      </div>

                      {/* Active Status Checkbox */}
                      {isEditingStaff && (
                        <div className="flex items-center gap-3 pt-1">
                          <input
                            id="staff-active-check"
                            type="checkbox"
                            checked={staffActiveInput}
                            onChange={(e) => setStaffActiveInput(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-primary focus:ring-0"
                          />
                          <label htmlFor="staff-active-check" className="text-xs font-semibold text-slate-300">
                            Account Active (Staff can log into Admin Dashboard)
                          </label>
                        </div>
                      )}

                      {/* Granular Permission Toggles */}
                      <div className="space-y-4 border-t border-slate-800 pt-6">
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Granular Permission Access Controls
                        </h3>

                        <div className="space-y-6">
                          {PERMISSION_GROUPS.map((group) => (
                            <div key={group.title} className="bg-slate-950 border border-slate-800/80 p-4 space-y-3">
                              <h4 className="text-xs font-bold text-primary">{group.title}</h4>
                              <div className="space-y-2.5">
                                {group.permissions.map((perm) => {
                                  const isChecked = Boolean(staffPermsInput[perm.key]);
                                  return (
                                    <label
                                      key={perm.key}
                                      className="flex items-start gap-3 cursor-pointer group"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handlePermissionToggle(perm.key)}
                                        className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-slate-900 text-primary focus:ring-0"
                                      />
                                      <div>
                                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                                          {perm.label}
                                        </p>
                                        <p className="text-[11px] text-slate-500">{perm.description}</p>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Save Buttons */}
                      <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingStaff(false);
                            setIsEditingStaff(false);
                            setSelectedStaff(null);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-5 py-3 transition-colors"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={submittingStaff}
                          className="bg-primary text-primary-foreground text-xs font-bold px-8 py-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                        >
                          {submittingStaff ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                              <span>Saving Account...</span>
                            </div>
                          ) : (
                            <span>{isAddingStaff ? 'Create Staff Account' : 'Save Permissions'}</span>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
                    System Activity & Audit Logs
                  </h1>
                  <p className="text-xs text-slate-400">
                    Immutable security log of all administrative actions, customer replies, product changes, and staff updates
                  </p>
                </div>

                <button
                  onClick={loadAuditLogs}
                  disabled={auditLogsLoading}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${auditLogsLoading ? 'animate-spin' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Refresh Audit Logs</span>
                </button>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'All Activity' },
                  { id: 'customer_reply', label: '💬 Customer Replies' },
                  { id: 'order_update', label: '🎂 Custom Orders' },
                  { id: 'product_change', label: '🍰 Products' },
                  { id: 'category_change', label: '🏷️ Categories' },
                  { id: 'creation_change', label: '🖼️ Gallery' },
                  { id: 'settings_change', label: '⚙️ Settings' },
                  { id: 'staff_change', label: '👥 Staff Changes' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => setAuditCategoryFilter(flt.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-none border transition-colors ${
                      auditCategoryFilter === flt.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>

              {/* Audit Table */}
              <div className="bg-slate-900 border border-slate-800 overflow-hidden">
                {auditLogsError ? (
                  <div className="p-12 text-center text-xs text-rose-400 font-semibold space-y-3">
                    <p>⚠️ {auditLogsError}</p>
                    <button
                      onClick={loadAuditLogs}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 font-semibold border border-slate-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : auditLogsLoading ? (
                  <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Loading system audit logs...</span>
                  </div>
                ) : auditLogsList.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-300">No Activity Audit Logs Found</p>
                    <p className="text-[11px]">Audit records will automatically appear here in real-time as staff and admins perform actions across the system.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4">Date & Time</th>
                          <th className="py-3.5 px-4">Staff Member</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Action Summary</th>
                          <th className="py-3.5 px-4">Details / Content</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {auditLogsList
                          .filter((log) => auditCategoryFilter === 'all' || log.category === auditCategoryFilter)
                          .map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                                {log.timestamp?.toDate
                                  ? log.timestamp.toDate().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
                                  : 'Just now'}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-white">{log.userName || log.userEmail}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400">{log.userEmail}</span>
                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 font-bold uppercase">
                                      {getRoleLabel(log.userRole || log.role || 'super_admin')}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-950 text-slate-300 border border-slate-800">
                                  {log.category ? log.category.replace('_', ' ') : 'action'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 font-medium text-slate-200">
                                {log.action}
                              </td>

                              <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                                {log.details || '—'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Category Cover Image Selection Modal */}
      {coverModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Select Category Cover Image
                </h3>
                <p className="text-xs text-slate-400">
                  Category: <span className="text-primary font-bold">{coverModalCategory.name}</span>
                </p>
              </div>
              <button
                onClick={() => setCoverModalCategory(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Current Cover Preview */}
            <div className="flex items-center gap-4 bg-slate-950 p-4 border border-slate-800/80">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-primary/40 bg-slate-900 shrink-0">
                <img
                  src={resolveCategoryCoverImage(coverModalCategory, products)}
                  alt={coverModalCategory.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200">Current Active Cover Image</p>
                <p className="text-[11px] text-slate-400">
                  {coverModalCategory.image ? 'Custom cover image set in database.' : 'Automatically dynamically selected from product images.'}
                </p>
                {coverModalCategory.image && (
                  <button
                    onClick={() => handleSelectCategoryCoverImage(coverModalCategory.id, '', '')}
                    className="text-[11px] font-semibold text-rose-400 hover:underline pt-1 block"
                  >
                    Reset to Auto-Product Cover
                  </button>
                )}
              </div>
            </div>

            {/* Upload Custom Cover */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Upload New Custom Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCategoryCoverImage}
                disabled={uploadingCategoryCover}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
              />
              {uploadingCategoryCover && (
                <p className="text-xs text-primary font-semibold animate-pulse">Uploading cover image to Cloudinary...</p>
              )}
              {categoryCoverError && (
                <p className="text-xs text-rose-400 font-semibold">⚠️ {categoryCoverError}</p>
              )}
            </div>

            {/* Select from existing products in this category */}
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select from Products in "{coverModalCategory.name}"
              </h4>

              {(() => {
                const categoryProducts = products.filter(
                  (p) => normalizeCategoryName(p.category) === normalizeCategoryName(coverModalCategory.name) && p.image
                );

                if (categoryProducts.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 border border-slate-800">
                      No products with images exist in this category yet. Upload a new product or upload a custom cover above.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 bg-slate-950 border border-slate-800">
                    {categoryProducts.map((prod) => {
                      const isSelected = coverModalCategory.image === prod.image;
                      return (
                        <button
                          key={prod.id}
                          onClick={() => handleSelectCategoryCoverImage(coverModalCategory.id, prod.image, prod.imagePublicId)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 group ${
                            isSelected ? 'border-primary shadow-lg ring-2 ring-primary/50' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] text-white font-bold truncate">{prod.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              Cover
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-4">
              <button
                onClick={() => setCoverModalCategory(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-5 py-2.5 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Action Confirmation Modal */}
      {orderActionModal && orderActionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 space-y-6 shadow-2xl rounded-none">
            <div className="space-y-2">
              <h3 className={`font-serif text-lg font-bold flex items-center gap-2 ${
                orderActionModal.action === 'confirm' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {orderActionModal.action === 'confirm' ? '✅ Confirm Order' : '❌ Reject Order'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {orderActionModal.action === 'confirm'
                  ? `Are you sure you want to confirm this ${orderActionModal.itemType === 'inquiry' ? 'inquiry' : 'custom order'} for ${orderActionModal.item.customerName || orderActionModal.item.fullName || 'Customer'}?`
                  : `Are you sure you want to reject this ${orderActionModal.itemType === 'inquiry' ? 'inquiry' : 'custom order'} for ${orderActionModal.item.customerName || orderActionModal.item.fullName || 'Customer'}?`}
              </p>
              <p className="text-[11px] text-slate-400 italic bg-slate-950 p-3 border border-slate-800">
                {orderActionModal.action === 'confirm'
                  ? 'The customer will receive a notification: "Your order has been confirmed by Queen\'s Bakery."'
                  : 'The customer will receive a notification: "Unfortunately, your order could not be accepted at this time."'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submittingOrderAction}
                onClick={() => setOrderActionModal(null)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-none transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingOrderAction}
                onClick={executeOrderAction}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-none transition-opacity disabled:opacity-50 flex items-center gap-2 ${
                  orderActionModal.action === 'confirm'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submittingOrderAction ? (
                  <span>Processing...</span>
                ) : (
                  <span>{orderActionModal.action === 'confirm' ? 'Confirm Order' : 'Reject Order'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
