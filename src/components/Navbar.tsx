'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import { subscribeCustomerNotifications, CustomerNotification, markNotificationAsRead, markAllCustomerNotificationsAsRead } from '@/lib/notifications';

export default function Navbar() {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    inquiryCart,
    setInquiryModalOpen,
    t,
  } = useApp();

  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to customer notifications in real time when authenticated
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeCustomerNotifications(user.uid, (data) => {
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const customerName = user ? (profile?.fullName || user.displayName || 'Customer') : 'Guest';

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.creations'), href: '/our-creations' },
    { label: t('nav.customOrders'), href: '/custom-orders' },
    { label: t('nav.delivery'), href: '/delivery' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  const cartItemCount = inquiryCart.reduce((total, item) => total + item.quantity, 0);

  const handleAccountClick = () => {
    if (user) {
      router.push('/account');
    } else {
      router.push('/login');
    }
  };

  const handleNotificationClick = async (notif: CustomerNotification) => {
    if (notif.id && !notif.read) {
      await markNotificationAsRead(notif.id);
    }
    setIsNotifDropdownOpen(false);
    setIsMobileMenuOpen(false);

    if (notif.targetType === 'customOrders') {
      router.push('/account/orders');
    } else {
      router.push('/account/inquiries');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-primary/20 bg-card/95 backdrop-blur-md transition-colors duration-300 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            <div className="flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 text-[15px] font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-xs border border-primary/20 rounded-none'
                        : 'text-foreground/90 hover:text-primary hover:bg-accent/40 rounded-none'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-l border-border/80 pl-6">
              
              {/* Language Selector */}
              <div className="flex items-center bg-accent/60 p-1 border border-border/80 rounded-none">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('si')}
                  className={`px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                    language === 'si'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  සිං
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="flex items-center justify-center w-10 h-10 border border-border/80 bg-accent/30 hover:bg-accent text-foreground transition-all duration-200 rounded-none"
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M3 12h2.25m13.5 0H21m-16.78 6.78l1.59-1.59M18.78 5.22l-1.59 1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                  </svg>
                )}
              </button>

              {/* Inquiry Cart Icon Button */}
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 border border-border/80 bg-accent/30 hover:bg-accent text-foreground transition-all duration-200 rounded-none cursor-pointer"
                aria-label="View Selected Inquiry Items"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Customer Notifications Bell Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                    className="relative flex items-center justify-center w-10 h-10 border border-border/80 bg-accent/30 hover:bg-accent text-foreground transition-all duration-200 rounded-none cursor-pointer"
                    aria-label="Customer Notifications"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isNotifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border shadow-2xl z-50 animate-in fade-in duration-150 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-foreground">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5">
                              {unreadCount} Unread
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllCustomerNotificationsAsRead(user.uid)}
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-muted-foreground">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 border transition-colors cursor-pointer space-y-1 ${
                                notif.read
                                  ? 'bg-background/40 border-border/50 opacity-80 hover:opacity-100'
                                  : 'bg-primary/5 border-primary/30 shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-xs font-bold text-foreground line-clamp-1">
                                  {notif.title}
                                </span>
                                {!notif.read && (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              {notif.status && (
                                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-accent/40 text-foreground/80 px-2 py-0.5 border border-border/60 mt-1">
                                  Status: {notif.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-border/60 pt-2 text-center">
                        <Link
                          href="/account/inquiries"
                          onClick={() => setIsNotifDropdownOpen(false)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View Inquiries & Orders ➔
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account Button displaying Customer Name */}
              <button
                onClick={handleAccountClick}
                className="flex items-center gap-2.5 px-4 py-2 border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 rounded-none cursor-pointer"
                aria-label="Account Access"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 01-7.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-xs font-bold truncate max-w-[120px]">
                  {customerName}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Bar Icons & Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            
            {/* Mobile Notification Bell */}
            {user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setIsNotifDropdownOpen(!isNotifDropdownOpen);
                }}
                className="relative flex items-center justify-center w-10 h-10 border border-border/80 bg-accent/40 text-foreground transition-all duration-200 rounded-none"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Mobile Cart */}
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 border border-border/80 bg-accent/40 text-foreground transition-all duration-200 rounded-none"
              aria-label="View Selected Inquiry Items"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 border border-border/80 bg-accent/40 text-foreground transition-all duration-200 rounded-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border/80 bg-card/98 backdrop-blur-md transition-all duration-300 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="space-y-2 px-4 py-5 sm:px-6">
            
            {/* Customer Greeting Header in Mobile Drawer */}
            <div className="flex items-center justify-between p-3 bg-accent/30 border border-border/60 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground font-bold text-xs">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{user ? user.email : 'Guest Visitor'}</p>
                </div>
              </div>
              {user && unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5">
                  {unreadCount} New
                </span>
              )}
            </div>

            {/* Mobile Nav Links */}
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary'
                      : 'text-foreground/90 hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Notifications link for mobile */}
            {user && (
              <Link
                href="/account/inquiries"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-base font-semibold text-foreground/90 hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <span>🔔</span> My Notifications & Orders
                </span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <div className="flex flex-col gap-4 border-t border-border/80 pt-4 mt-3">
              
              {/* Language Switcher */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Language</span>
                <div className="flex items-center bg-accent/60 p-1 border border-border">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      language === 'en'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('si');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      language === 'si'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    සිංහල
                  </button>
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Theme Mode</span>
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 border border-border bg-accent/50 px-4 py-2 text-xs font-semibold text-foreground transition-colors duration-200"
                >
                  {theme === 'light' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.59 1.59m12.38 12.38l1.59 1.59M3 12h2.25m13.5 0H21m-16.78 6.78l1.59-1.59M18.78 5.22l-1.59 1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                      </svg>
                      Light Mode
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Account / Login CTA */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleAccountClick();
                }}
                className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:opacity-95 mt-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 01-7.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {user ? `My Account (${customerName})` : 'Login / Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
