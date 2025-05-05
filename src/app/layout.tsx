'use client';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { EventsProvider } from '@/context/EventsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster";
import AdBannerManagerClient from '@/app/AdBannerManagerClient'; 
import { BottomNavigation } from '@/components/BottomNavigation';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat-config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initRevenueCat = async () => {
        try {
          await Purchases.configure({
            apiKey: Capacitor.getPlatform() === 'ios'
              ? REVENUECAT_CONFIG.API_KEY.ios
              : REVENUECAT_CONFIG.API_KEY.android,
            appUserID: null // RevenueCatがユーザーIDを自動生成
          });
          console.log('RevenueCat initialized successfully');
        } catch (error) {
          console.error('Failed to initialize RevenueCat:', error);
        }
      };
      
      initRevenueCat();
    }
  }, []);

  return (
    // Set language to Japanese
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SidebarProvider defaultOpen={false} style={{ '--sidebar-width': '16rem' } as React.CSSProperties}>
            <SubscriptionProvider>
              <EventsProvider>
               {/* Main content container */}
               <div className="flex flex-col min-h-screen">
                 {/* Content area with dynamic padding for the ad banner space and BottomNavigation */}
                 <div className="flex-1 pb-[116px] md:pb-[154px] relative z-10"> {/* 56+60, 64+90 */}
                   {children}
                 </div>
                 {/* BottomNavigation */}
                 <BottomNavigation />
                 {/* Ad Banner is now self-contained with fixed positioning */}
                 <AdBannerManagerClient />
               </div>
               {/* Toaster for notifications */}
               <Toaster />
              </EventsProvider>
            </SubscriptionProvider>
         </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

