import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { EventsProvider } from '@/context/EventsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster";
import AdBannerManagerClient from '@/app/AdBannerManagerClient'; 
import BottomNavigation from '@/components/BottomNavigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Define metadata for the app
export const metadata: Metadata = {
  // Use the shorter name for the general title
  title: '予算・集金管理',
  // Use the longer name for the description
  description: '予算・集金かんたん管理｜サークル費や飲み会費が管理できる会計アプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                 {/* Content area with dynamic padding for the ad banner space */}
                 <div className="flex-1 pb-[60px] md:pb-[100px] relative z-10"> {/* Added z-10 to keep content above ad */}
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

