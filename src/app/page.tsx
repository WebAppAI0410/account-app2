'use client';

import React, { useState } from 'react'; // Keep useState for local dialog state
import { useEvents } from '@/context/EventsContext'; // Import the context hook
import { useIsMobile } from '@/hooks/use-mobile'; // Import the mobile detection hook
import { useIsTablet, useIsDesktop } from '@/hooks/use-tablet'; // Import tablet and desktop detection hooks
import { ThemeToggle } from '@/components/ThemeToggle'; // Import theme toggle component
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventList } from '@/components/EventList';
import { EventCreateDialog } from '@/components/EventCreateDialog';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import useTranslation from '@/hooks/use-translation';

// Define the Event type (consider moving to a shared types file)
interface Event {
  id: string;
  name: string;
  date: string; // Keep as string for simplicity, or use Date
  description: string;
  collectionStartDate?: string; // Add collection start date (optional)
  collectionEndDate?: string;   // Add collection end date (optional)
}

// Define the type for the data coming from the dialog
// Use string for dates to match the data from EventCreateDialog
interface NewEventFormData {
  name: string;
  description: string;
  collectionStartDate?: string; 
  collectionEndDate?: string;   
}

// Remove local state management for events and related functions
// const formatSimpleDate = ... (moved to context)
// const initialEventsData = ... (moved to context)

export default function Home() {
  // Get events state and functions from context
  const { events, setEvents, addEvent, deleteEvent } = useEvents();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const isMobile = useIsMobile(); // Detect if we're on a mobile device
  const isTablet = useIsTablet(); // Detect if we're on a tablet device
  const isDesktop = useIsDesktop(); // Detect if we're on a desktop device
  const { state } = useSidebar(); // Get sidebar state
  
  // メインコンテンツのクラス - よりシンプルでスタイリッシュなレイアウトに
  const mainContentClass = React.useMemo(() => {
    return cn(
      "w-full space-y-6 transition-all duration-300 ease-out max-w-full",
      "px-4 py-6 md:px-6 lg:px-8", // 端末サイズによる余白調整
      "bg-background/30 backdrop-blur-[2px]" // 微妙な背景ブラー効果
    );
  }, []);

  // Function to handle reordering (uses setEvents from context)
  const handleReorderEvents = (reorderedEvents: Event[]) => {
    setEvents(reorderedEvents); // Directly use setEvents from context
  };

  // Adapt the onEventCreated prop for EventCreateDialog
  const handleCreateEvent = (newEventData: NewEventFormData) => {
    // Prepare the event data, letting the context addEvent handle id and default date
    const eventToAdd: Omit<Event, 'id'> = {
      name: newEventData.name,
      description: newEventData.description,
      date: '', // Context will provide default if empty
      // Dates are already strings in 'yyyy-MM-dd' format from the dialog
      collectionStartDate: newEventData.collectionStartDate,
      collectionEndDate: newEventData.collectionEndDate,
    };
    addEvent(eventToAdd); // Call addEvent from context
  };


  return (
    // よりシンプルなグリッドレイアウトで分割
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] min-h-screen relative overflow-x-hidden">
      {/* ハンバーガーメニューボタン - より洗練されたデザイン */}
      <div className="fixed top-4 right-4 z-50">
        <SidebarTrigger
          className="bg-background/80 backdrop-blur-md shadow-sm rounded-full p-2.5 transition-all hover:shadow-md"
          aria-label={t('Open Menu')}
          aria-expanded={state === "expanded"}
          aria-controls="sidebar-content"
        >
          <Icons.menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </SidebarTrigger>
      </div>
      
      {/* サイドバー - よりエレガントなデザイン */}
      <Sidebar side="right" id="sidebar-content" className="border-l shadow-lg">
        <SidebarHeader className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <Icons.coins className="h-6 w-6 text-primary" />
            <h4 className="font-medium text-lg tracking-tight">{t('EventBalance')}</h4>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarMenu>
            <SidebarMenuItem className="my-1">
              <SidebarTrigger className="hover:bg-accent/50 rounded-md transition-colors">
                <Icons.list className="mr-2 h-4 w-4" />
                <span>{t('Events')}</span>
              </SidebarTrigger>
            </SidebarMenuItem>
            
            {/* テーマ切替 - よりシンプルなレイアウト */}
            <SidebarMenuItem className="my-1">
              <div className="flex justify-between items-center w-full px-3 py-2 hover:bg-accent/50 rounded-md transition-colors">
                <div className="flex items-center">
                  <Icons.dark className="mr-2 h-4 w-4" />
                  <span>{t('Theme')}</span>
                </div>
                <ThemeToggle />
              </div>
            </SidebarMenuItem>
            
            {/* 使い方ページへのリンク */}
            <SidebarMenuItem className="my-1">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-accent/50 rounded-md"
                onClick={() => router.push('/how-to')}
              >
                <Icons.help className="mr-2 h-4 w-4" />
                <span>{t('How to Use')}</span>
              </Button>
            </SidebarMenuItem>
            
            {/* プランページへのリンク */}
            <SidebarMenuItem className="my-1">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-accent/50 rounded-md"
                onClick={() => router.push('/plans')}
              >
                <Icons.creditCard className="mr-2 h-4 w-4" />
                <span>{t('Plans')}</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="my-2" />
          <div className="p-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsCreateEventOpen(true)} 
              className="w-full shadow-sm hover:shadow transition-all"
            >
              <Icons.plus className="mr-2 h-4 w-4" />
              {t('Create Event')}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* メインコンテンツ - よりすっきりとしたレイアウト */}
      <main
        className={mainContentClass}
        style={{
          transitionProperty: 'width, margin, background',
          willChange: 'width, margin, opacity'
        }}
        aria-label="イベント一覧"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">イベント一覧</h2>
        </div>
        
        <div className="relative">
          <EventList
            events={events}
            onDelete={deleteEvent}
            onReorder={handleReorderEvents}
          />
        </div>
      </main>

      {/* フローティングアクションボタン - よりモダンなデザイン */}
      <Button
        className="fixed bottom-[70px] right-4 rounded-full w-14 h-14 shadow-lg hover:shadow-xl z-50 transition-all duration-300"
        onClick={() => setIsCreateEventOpen(true)}
      >
        <Icons.plus className="h-6 w-6" />
        <span className="sr-only">{t('Create Event')}</span>
      </Button>
      
      <EventCreateDialog
        open={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onEventCreated={handleCreateEvent}
      />
    </div>
  );
}
