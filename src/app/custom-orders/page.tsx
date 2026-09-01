'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore/lite';

export default function CustomOrdersPage() {
  const { user, profile } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceImage, setReferenceImage] = useState('');

  // UX Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [saveSuccessButton, setSaveSuccessButton] = useState(false);

  // Delivery Areas
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

  // Pre-fill profile details when authenticated
  useEffect(() => {
    if (profile) {
      setName(profile.fullName || '');
      setMobile(profile.phone || '');
      setWhatsapp(profile.whatsapp || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!user) {
      alert(
        language === 'en'
          ? "Please login or create an account to request a custom order!"
          : "විශේෂ ඇණවුමක් ඉල්ලුම් කිරීමට කරුණාකර පළමුව ගිණුමට ඇතුල් වන්න!"
      );
      router.push('/login');
      return;
    }

    if (!name || !email || !mobile || !requestedDate || !deliveryLocation || !requirements) {
      setSubmitError(
        language === 'en'
          ? "Please fill in all required fields."
          : "කරුණාකර සියලුම අනිවාර්ය තොරතුරු ඇතුළත් කරන්න."
      );
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "customOrders"), {
        userId: user.uid,
        customerName: name,
        customerEmail: email,
        mobile: mobile,
        whatsapp: whatsapp || mobile,
        requestedDate: requestedDate,
        deliveryLocation: deliveryLocation,
        requirements: requirements,
        notes: notes || '',
        referenceImage: referenceImage || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Reset form variables (except user metadata)
      setRequestedDate('');
      setDeliveryLocation('');
      setRequirements('');
      setNotes('');
      setReferenceImage('');

      setSubmitSuccess(true);
      setSaveSuccessButton(true);
      
      setTimeout(() => {
        setSaveSuccessButton(false);
      }, 2500);

    } catch (err: any) {
      console.error("Custom order submission failed:", err);
      setSubmitError(
        language === 'en'
          ? "Unable to save response. Please try again."
          : "ඔබගේ ඉල්ලීම ඉදිරිපත් කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              ✨ Bespoke Creations
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {language === 'en' ? "Request a Custom Order" : "විශේෂ ඇණවුමක් ඉල්ලුම් කරන්න"}
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {language === 'en'
                ? "Provide your design ideas, flavors, portions, and delivery specifics for custom evaluation."
                : "ඔබගේ කේක් මෝස්තර, රසයන් සහ බෙදාහැරීමේ විස්තර ඇතුළත් කරන්න."}
            </p>
            <div className="h-1 w-12 bg-primary rounded-full mt-2 mx-auto" />
          </div>

          {/* Form container */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            
            {!user ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-xs text-muted-foreground">
                  {language === 'en'
                    ? "You must be signed in to request custom orders. Your design specs will be linked directly to your dashboard."
                    : "විශේෂ ඇණවුම් ඉල්ලීමට කරුණාකර පළමුව ගිණුමට ඇතුල් වන්න."}
                </p>
                <Link href="/login" className="inline-block rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold hover:opacity-95 shadow-md">
                  {language === 'en' ? "Login to Account" : "ගිණුමට ඇතුල් වන්න"}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {submitError && (
                  <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary font-semibold text-center animate-in fade-in duration-200">
                    ⚠️ {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 font-semibold text-center space-y-2 animate-in fade-in duration-200">
                    <div>✔️ Response saved successfully.</div>
                    <Link href="/account/orders" className="underline font-bold block">
                      {language === 'en' ? "Go to My Custom Orders →" : "මගේ විශේෂ ඇණවුම් පිටුවට යන්න →"}
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="custom-name" className="text-xs font-semibold text-foreground/95">
                      {language === 'en' ? 'Full Name' : 'සම්පූර්ණ නම'} *
                    </label>
                    <input
                      id="custom-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="custom-email" className="text-xs font-semibold text-foreground/95">
                      {language === 'en' ? 'Email Address' : 'විද්‍යුත් තැපෑල'} *
                    </label>
                    <input
                      id="custom-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 opacity-80"
                      disabled
                    />
                  </div>

                  {/* Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="custom-mobile" className="text-xs font-semibold text-foreground/95">
                      {language === 'en' ? 'Mobile Phone' : 'දුරකථන අංකය'} *
                    </label>
                    <input
                      id="custom-mobile"
                      type="tel"
                      required
                      placeholder="+94 7X XXX XXXX"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="custom-whatsapp" className="text-xs font-semibold text-foreground/95">
                      WhatsApp Number
                    </label>
                    <input
                      id="custom-whatsapp"
                      type="tel"
                      placeholder="+94 7X XXX XXXX (Optional)"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Requested Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="custom-date" className="text-xs font-semibold text-foreground/95">
                      {language === 'en' ? 'Requested Date' : 'අවශ්‍ය දිනය'} *
                    </label>
                    <input
                      id="custom-date"
                      type="date"
                      required
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Location Area */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="custom-location" className="text-xs font-semibold text-foreground/95">
                      {language === 'en' ? 'Delivery / Pickup Location' : 'බෙදාහැරීමේ / ලබාගන්නා ස්ථානය'} *
                    </label>
                    <select
                      id="custom-location"
                      required
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="" disabled>
                        Select Location
                      </option>
                      <option value="Pickup - Negombo Store">Pickup - Negombo Store</option>
                      {deliveryAreas.map((loc) => (
                        <option key={loc} value={loc}>
                          Delivery: {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Order Requirements */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="custom-requirements" className="text-xs font-semibold text-foreground/95">
                    {language === 'en' ? 'Customization Details / Requirements' : 'විශේෂ නිර්මාණ අවශ්‍යතා විස්තර'} *
                  </label>
                  <textarea
                    id="custom-requirements"
                    rows={4}
                    required
                    placeholder="Describe flavour layers, frosting options, themed cake tags, portion size (e.g. 1kg, 2kg), and cake writing text..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 resize-none"
                  />
                </div>

                {/* Reference Image Link */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="custom-image" className="text-xs font-semibold text-foreground/95">
                    Reference Image URL (Optional)
                  </label>
                  <input
                    id="custom-image"
                    type="url"
                    placeholder="https://example.com/cake-design.jpg"
                    value={referenceImage}
                    onChange={(e) => setReferenceImage(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60"
                  />
                </div>

                {/* Special Notes */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="custom-notes" className="text-xs font-semibold text-foreground/95">
                    {language === 'en' ? 'Additional Instructions / Message' : 'අමතර සටහන් / පණිවිඩය'}
                  </label>
                  <textarea
                    id="custom-notes"
                    rows={2}
                    placeholder="Any specific delivery instructions, timing details, or other notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {submitting ? (
                    <span>Saving...</span>
                  ) : saveSuccessButton ? (
                    <span>Saved ✓</span>
                  ) : (
                    <span>{language === 'en' ? "Request Custom Order" : "විශේෂ ඇණවුමක් ඉල්ලුම් කරන්න"}</span>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>
      </main>

      <Footer />
      <InquiryModal />
    </div>
  );
}
