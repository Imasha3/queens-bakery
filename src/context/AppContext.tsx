'use client';

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/locales/translations";
import { fetchSocialSettings, SocialSettings, DEFAULT_SOCIAL_SETTINGS } from "@/lib/settings";

export interface SelectedInquiryItem {
  id: string; // unique cart item id (e.g. productId + size + flavour + style)
  productId: string;
  name: string;
  category: string;
  image: string;
  quantity: number;
  options?: {
    size?: string;
    flavour?: string;
    message?: string;
    style?: string;
    [key: string]: any;
  };
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  inquiryCart: SelectedInquiryItem[];
  addToInquiry: (item: Omit<SelectedInquiryItem, 'id'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromInquiry: (itemId: string) => void;
  clearInquiry: () => void;
  isInquiryModalOpen: boolean;
  setInquiryModalOpen: (open: boolean) => void;
  t: (key: string) => any;
  socialSettings: SocialSettings;
  refreshSocialSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [inquiryCart, setInquiryCart] = useState<SelectedInquiryItem[]>([]);
  const [isInquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(DEFAULT_SOCIAL_SETTINGS);

  // Load state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang === "en" || savedLang === "si") {
      setLanguageState(savedLang);
    }

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setThemeState(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    const savedCart = localStorage.getItem("inquiryCart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Robust backward-compatibility: if the stored cart is still a string array (from previous iteration), reset it.
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          setInquiryCart([]);
          localStorage.removeItem("inquiryCart");
        } else if (Array.isArray(parsed)) {
          setInquiryCart(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const addToInquiry = (newItem: Omit<SelectedInquiryItem, 'id'>) => {
    // Generate a unique ID based on item selection options
    const optionsString = newItem.options ? JSON.stringify(newItem.options) : "";
    const uniqueId = `${newItem.productId}-${optionsString}`;

    setInquiryCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === uniqueId);
      let updated: SelectedInquiryItem[];

      if (existingIdx > -1) {
        // Increment quantity of existing item
        updated = prev.map((item, idx) => 
          idx === existingIdx 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add as new item
        updated = [...prev, { ...newItem, id: uniqueId }];
      }

      localStorage.setItem("inquiryCart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromInquiry(itemId);
      return;
    }
    setInquiryCart((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      localStorage.setItem("inquiryCart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromInquiry = (itemId: string) => {
    setInquiryCart((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      localStorage.setItem("inquiryCart", JSON.stringify(updated));
      return updated;
    });
  };

  const clearInquiry = () => {
    setInquiryCart([]);
    localStorage.removeItem("inquiryCart");
  };

  const t = (path: string): any => {
    const parts = path.split(".");
    let val: any = translations[language];
    for (const part of parts) {
      if (val && typeof val === "object" && part in val) {
        val = val[part];
      } else {
        return path;
      }
    }
    return val;
  };

  const refreshSocialSettings = async () => {
    try {
      const settings = await fetchSocialSettings();
      setSocialSettings(settings);
    } catch (e) {
      // ignore
    }
  };

  // Fetch social settings from Firestore on mount
  useEffect(() => {
    refreshSocialSettings();
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        inquiryCart,
        addToInquiry,
        updateQuantity,
        removeFromInquiry,
        clearInquiry,
        isInquiryModalOpen,
        setInquiryModalOpen,
        t,
        socialSettings,
        refreshSocialSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
