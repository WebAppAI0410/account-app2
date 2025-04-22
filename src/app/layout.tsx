import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { EventsProvider } from '@/context/EventsContext';
import { Toaster } from "@/components/ui/toaster";
import AdBannerManagerClient from '@/app/AdBannerManagerClient'; // Use path alias

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
        <EventsProvider>
           {/* Main content container */}
           <div className="flex flex-col min-h-screen">
             {/* Content area with dynamic padding for the ad banner space */}
             <div className="flex-1 pb-[60px] md:pb-[100px]"> {/* Added padding for ad space */}
               {children}
             </div>
             
             {/* Ad Banner Manager at the bottom of the layout */}
             <AdBannerManagerClient />
           </div>
           {/* Toaster for notifications */}
           <Toaster />
        </EventsProvider>
      </body>
    </html>
  );
}

