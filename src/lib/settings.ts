import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';

export interface SocialSettings {
  facebook: string;
  tiktok: string;
  whatsapp: string;
}

export const DEFAULT_SOCIAL_SETTINGS: SocialSettings = {
  facebook: 'https://www.facebook.com/share/1PvU3PT5qW/?mibextid=wwXIfr',
  tiktok: 'https://www.tiktok.com/@queensbakerysl?_r=1&_t=ZS-98ea3S2mGf4',
  whatsapp: 'https://wa.me/94771234567',
};

/**
 * Validates whether a string is a valid HTTP/HTTPS URL.
 * Returns true if empty (optional field).
 */
export function isValidHttpUrl(url: string): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Formats a phone number or WhatsApp input into a valid wa.me URL.
 */
export function formatWhatsAppLink(input: string): string {
  if (!input || !input.trim()) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Strip non-digits
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length > 0) {
    return `https://wa.me/${digits}`;
  }
  return trimmed;
}

/**
 * Fetches the social media settings from Firestore 'settings/socialMedia'.
 * Returns default settings if doc does not exist or read fails.
 */
export async function fetchSocialSettings(): Promise<SocialSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'socialMedia'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        facebook: data.facebook !== undefined ? data.facebook : DEFAULT_SOCIAL_SETTINGS.facebook,
        tiktok: data.tiktok !== undefined ? data.tiktok : DEFAULT_SOCIAL_SETTINGS.tiktok,
        whatsapp: data.whatsapp !== undefined ? data.whatsapp : DEFAULT_SOCIAL_SETTINGS.whatsapp,
      };
    }
  } catch (error) {
    console.error('Error fetching social settings from Firestore:', error);
  }
  return DEFAULT_SOCIAL_SETTINGS;
}

/**
 * Saves or updates social media settings in Firestore 'settings/socialMedia'.
 */
export async function updateSocialSettings(settings: SocialSettings): Promise<void> {
  const docRef = doc(db, 'settings', 'socialMedia');
  await setDoc(
    docRef,
    {
      facebook: settings.facebook.trim(),
      tiktok: settings.tiktok.trim(),
      whatsapp: formatWhatsAppLink(settings.whatsapp),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
