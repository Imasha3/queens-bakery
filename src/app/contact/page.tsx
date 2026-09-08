'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppCTA from '@/components/WhatsAppCTA';
import InquiryModal from '@/components/InquiryModal';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore/lite';
import { ContactShowcaseIllustration } from '@/components/BakeryIllustrations';

export default function ContactPage() {
  const { user, profile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill contact inputs if customer is logged in
  useEffect(() => {
    if (profile) {
      if (profile.fullName && !name) setName(profile.fullName);
      if (user?.email && !email) setEmail(user.email);
      if ((profile.phone || profile.whatsapp) && !phone) setPhone(profile.phone || profile.whatsapp || '');
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmittedSuccess(false);

    // Frontend Validation
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    setSubmitting(true);

    try {
      // Save contact message to Firestore 'contacts' collection
      await addDoc(collection(db, 'contacts'), {
        name: name.trim(),
        customerName: name.trim(),
        email: email.trim() || null,
        customerEmail: email.trim() || null,
        phone: phone.trim(),
        mobile: phone.trim(),
        message: message.trim(),
        status: 'unread',
        createdAt: serverTimestamp(),
      });

      setSubmittedSuccess(true);

      // Clear form inputs
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');

      // Automatically hide success alert after 7 seconds
      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 7000);
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setErrorMessage('Unable to send your message right now. Please try again or contact us via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-grow py-12">
        
        {/* Contact Page Header */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">
            Get In Touch
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Contact Queen's Bakery
          </h1>
          <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
          <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-lg mx-auto">
            We are based in Negombo, Sri Lanka and deliver fresh bespoke orders to Negombo, Seeduwa, Katunayake, Ja-Ela, Minuwangoda, Dankotuwa, Wennappuwa, and Marawila.
          </p>
        </div>

        {/* 2-Column Balanced Main Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start mb-16">
          
          {/* Left Column: Bakery Illustration & Quick Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Bakery Illustration Card */}
            <div className="bg-card border border-border/80 p-6 sm:p-8 rounded-none shadow-md space-y-6 relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold font-serif tracking-wider uppercase text-foreground">
                  🍰 Bespoke Orders & Support
                </span>
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-none">
                  Open 7 Days
                </span>
              </div>

              <div className="w-full max-w-xs mx-auto transition-transform duration-500 group-hover:scale-102">
                <ContactShowcaseIllustration />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <h4 className="font-serif text-sm font-bold text-foreground">
                  Direct Inquiries & Custom Cakes
                </h4>
                <p className="text-xs font-light text-muted-foreground leading-relaxed">
                  Have a question about custom gateaux, savory platters, or regional delivery dates? Send us a message or reach out via WhatsApp!
                </p>
              </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-card border border-border/80 p-5 rounded-none shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-base">🛍️</span>
                  <h3 className="font-serif text-sm font-bold text-foreground">Inquiries & Orders</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Place inquiries directly using our website bag. Simply browse products, add them to your inquiry basket, and submit your request.
                </p>
              </div>
              
              <div className="bg-card border border-border/80 p-5 rounded-none shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-base">🕒</span>
                  <h3 className="font-serif text-sm font-bold text-foreground">Operating Hours</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We process custom bakes 7 days a week. For custom orders, we recommend inquiring at least 3-5 days in advance.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border/80 p-6 sm:p-8 rounded-none shadow-md space-y-6">
              <div className="space-y-1 border-b border-border/60 pb-4">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Send Us a Message
                </h2>
                <p className="text-xs text-muted-foreground">
                  Have a question or special request? Send us a message and our team will respond shortly.
                </p>
              </div>

              {submittedSuccess && (
                <div className="rounded-none bg-emerald-500/10 border border-emerald-500/25 p-4 text-center text-xs text-emerald-600 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                  Message sent successfully ✓ Thank you for reaching out to Queen's Bakery!
                </div>
              )}

              {errorMessage && (
                <div className="rounded-none bg-rose-500/10 border border-rose-500/25 p-4 text-center text-xs text-rose-600 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Customer Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="text-xs font-semibold text-foreground/95">
                      Customer Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Sarah Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-none border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="text-xs font-semibold text-foreground/95">
                      Email Address <span className="font-normal text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="sarah@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-none border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="contact-phone" className="text-xs font-semibold text-foreground/95">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      placeholder="+94 7X XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-none border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="contact-message" className="text-xs font-semibold text-foreground/95">
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      placeholder="Write your message, feedback, or general inquiry here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="rounded-none border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none"
                    />
                  </div>

                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    <span>Send Message</span>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* WhatsApp Callout */}
        <WhatsAppCTA />
      </main>
      <Footer />
      <InquiryModal />
    </div>
  );
}
