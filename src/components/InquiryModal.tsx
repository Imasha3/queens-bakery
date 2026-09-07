'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore/lite';

export default function InquiryModal() {
  const {
    language,
    isInquiryModalOpen,
    setInquiryModalOpen,
    inquiryCart,
    updateQuantity,
    removeFromInquiry,
    clearInquiry,
    t,
  } = useApp();

  const { user, profile } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-populate name and contact when logged-in customer opens the modal
  useEffect(() => {
    if (isInquiryModalOpen && profile) {
      setName(profile.fullName || '');
      setContact(profile.phone || profile.whatsapp || '');
    }
  }, [isInquiryModalOpen, profile]);

  // Delivery Areas matching business rules
  const deliveryAreas = [
    "Negombo",
    "Seeduwa",
    "Katunayake",
    "Ja-Ela",
    "Minuwangoda",
    "Dankotuwa",
    "Wennappuwa",
    "Marawila"
  ];

  if (!isInquiryModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryCart.length === 0) {
      alert(t('products.noProducts'));
      return;
    }

    if (!user) {
      alert(
        language === 'en'
          ? "Please login or create an account to submit your inquiry! We've preserved your selected items."
          : "විමසීම ඉදිරිපත් කිරීමට කරුණාකර ගිණුමට ඇතුල් වන්න! ඔබ තෝරාගත් ද්‍රව්‍ය සුරක්ෂිතව පවතී."
      );
      setInquiryModalOpen(false); // Close modal
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // Map current items with explicit options
      const itemsData = inquiryCart.map((item) => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        image: item.image,
        quantity: item.quantity,
        size: item.options?.size || null,
        flavour: item.options?.flavour || null,
        message: item.options?.message || null,
        style: item.options?.style || null,
      }));

      // Write real document to Firestore "inquiries" collection
      await addDoc(collection(db, "inquiries"), {
        userId: user.uid,
        customerName: name,
        customerEmail: user.email,
        mobile: contact,
        whatsapp: profile?.whatsapp || contact,
        items: itemsData,
        notes: notes,
        requestedDate: date,
        deliveryLocation: location,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Advance state and clear cart only after successful save
      setSubmitted(true);
    } catch (err: any) {
      console.error("Inquiry submission failed:", err);
      setSubmitError(
        language === 'en'
          ? "Unable to submit your request. Please try again."
          : "ඔබගේ ඉල්ලීම ඉදිරිපත් කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setInquiryModalOpen(false);
    if (submitted) {
      setSubmitted(false);
      clearInquiry();
      setDate('');
      setLocation('');
      setName('');
      setContact('');
      setNotes('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-none bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/80 bg-background/50">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-foreground">
              {language === 'en' ? 'My Inquiry' : 'මගේ විමසීම'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Review selected items & request price quotation' : 'තෝරාගත් ද්‍රව්‍ය පරීක්ෂා කර මිල ගණන් ඉල්ලන්න'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Close Inquiry Drawer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.5 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0113.5 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {language === 'en' ? "Inquiry Submitted!" : "විමසීම ඉදිරිපත් කරන ලදී!"}
              </h3>
              <p className="text-sm font-light text-muted-foreground max-w-sm leading-relaxed">
                {t('inquiryModal.successMsg')}
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                <button
                  onClick={handleClose}
                  className="rounded-xl bg-accent px-6 py-2.5 text-xs font-semibold text-foreground shadow-sm hover:opacity-95"
                >
                  {language === 'en' ? "Close" : "වසා දමන්න"}
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    router.push('/account/inquiries');
                  }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95"
                >
                  {language === 'en' ? "View My Inquiries" : "මගේ විමසීම්"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Selected Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {language === 'en' ? 'Selected Items' : 'තෝරාගත් ද්‍රව්‍ය'}
                  </span>
                  {inquiryCart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearInquiry}
                      className="text-xs font-semibold text-primary hover:opacity-85"
                    >
                      {language === 'en' ? 'Clear All' : 'සියල්ල ඉවත් කරන්න'}
                    </button>
                  )}
                </div>
                
                {inquiryCart.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs font-light text-muted-foreground">
                    {t('products.noProducts')}
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 max-h-60 overflow-y-auto pr-1">
                    {inquiryCart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start"
                      >
                        {/* Mini image */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-accent/20 flex-shrink-0">
                          {typeof item.image === 'string' && item.image.trim() !== '' ? (
                            <img src={item.image.trim()} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accent/40 text-muted-foreground/60 text-[9px] font-bold uppercase tracking-tighter">
                              QB
                            </div>
                          )}
                        </div>

                        {/* Title & custom options */}
                        <div className="flex-grow min-w-0">
                          <h4 className="font-serif text-sm font-bold text-foreground truncate">
                            {item.name}
                          </h4>
                          
                          {/* Options display */}
                          {item.options && Object.keys(item.options).length > 0 && (
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                              {Object.entries(item.options).map(([key, val]) => {
                                if (!val) return null;
                                return (
                                  <span key={key} className="text-[10px] text-muted-foreground bg-accent/30 rounded px-1.5 py-0.5 border border-border/40 font-medium">
                                    <span className="capitalize">{key}</span>: {val}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Quantity Counter + Remove Column */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center rounded-lg bg-background border border-border p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex items-center justify-center w-6 h-6 rounded hover:bg-accent text-foreground text-xs font-bold transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex items-center justify-center w-6 h-6 rounded hover:bg-accent text-foreground text-xs font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromInquiry(item.id)}
                            className="text-[10px] font-semibold text-primary hover:opacity-85"
                          >
                            {language === 'en' ? "Remove" : "ඉවත් කරන්න"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inquiry Scheduling Form */}
              {inquiryCart.length > 0 && (
                <div className="border-t border-border/80 pt-6 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-foreground">
                    {language === 'en' ? 'Delivery Details' : 'බෙදාහැරීමේ තොරතුරු'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Date Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="inquiry-date" className="text-xs font-semibold text-foreground/95">
                        {t('inquiryModal.dateLabel')} *
                      </label>
                      <input
                        id="inquiry-date"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    {/* Location Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="inquiry-location" className="text-xs font-semibold text-foreground/95">
                        {t('inquiryModal.locationLabel')} *
                      </label>
                      <select
                        id="inquiry-location"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors [&_option]:bg-card [&_option]:text-foreground"
                      >
                        <option value="" disabled className="bg-card text-foreground">
                          {t('inquiryModal.selectLocation')}
                        </option>
                        {deliveryAreas.map((loc) => (
                          <option key={loc} value={loc} className="bg-card text-foreground">
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="inquiry-name" className="text-xs font-semibold text-foreground/95">
                        {t('inquiryModal.nameLabel')} *
                      </label>
                      <input
                        id="inquiry-name"
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    {/* Contact Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="inquiry-contact" className="text-xs font-semibold text-foreground/95">
                        {t('inquiryModal.contactLabel')} *
                      </label>
                      <input
                        id="inquiry-contact"
                        type="tel"
                        required
                        placeholder="+94 7X XXX XXXX"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                  </div>

                  {/* Notes Area */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="inquiry-notes" className="text-xs font-semibold text-foreground/95">
                      {t('inquiryModal.notesLabel')}
                    </label>
                    <textarea
                      id="inquiry-notes"
                      rows={2}
                      placeholder="Special instructions, dietary restrictions, flower delivery details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary font-semibold text-center animate-in fade-in duration-200">
                      ⚠️ {submitError}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-4 text-sm font-semibold shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                        <span>{language === 'en' ? 'Submitting request...' : 'ඉල්ලීම ඉදිරිපත් කරමින්...'}</span>
                      </div>
                    ) : (
                      <span>{language === 'en' ? 'Submit Price & Availability Request' : 'මිල ගණන් සහ තිබේදැයි විමසීම ඉදිරිපත් කරන්න'}</span>
                    )}
                  </button>
                </div>
              )}

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
