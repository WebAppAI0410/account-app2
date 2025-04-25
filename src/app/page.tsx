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
import { useSubscription } from '@/context/SubscriptionContext'; // サブスク判定用

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
  const { isPremium } = useSubscription(); // ←追加: プラン判定
  
  // Create conditional class for main content based on sidebar state
  // メインコンテンツのクラス - サイドバー開閉状態による幅・位置調整を完全に排除
  const mainContentClass = React.useMemo(() => {
    return cn(
      "w-full p-4 space-y-4 transition-all duration-300 ease-in-out max-w-full"
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
    // レイアウトの親要素はgridのまま、サイドバーとメインを明確に分離
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] min-h-screen relative overflow-x-hidden">
      {/* ハンバーガーメニューボタン */}
      <div className="fixed top-4 right-4 z-50">
        <SidebarTrigger
          className="bg-background/80 backdrop-blur-sm"
          aria-label={t('Open Menu')}
          aria-expanded={state === "expanded"}
          aria-controls="sidebar-content"
        >
          <Icons.menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </SidebarTrigger>
      </div>
      {/* サイドバー */}
      <Sidebar side="right" id="sidebar-content">
        <SidebarHeader>
          <div className="flex items-center space-x-2">
            <Icons.coins className="h-6 w-6" />
            <h4 className="font-semibold text-md">{t('EventBalance')}</h4>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarTrigger>
                <Icons.list className="mr-2 h-4 w-4" />
                <span>{t('Events')}</span>
              </SidebarTrigger>
            </SidebarMenuItem>
            
            {/* テーマ切替 */}
            <SidebarMenuItem>
              <div className="flex justify-between items-center w-full px-3 py-2">
                <div className="flex items-center">
                  <Icons.dark className="mr-2 h-4 w-4" />
                  <span>{t('Theme')}</span>
                </div>
                <ThemeToggle />
              </div>
            </SidebarMenuItem>
            
            {/* 使い方ページへのリンク */}
            <SidebarMenuItem>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/how-to')}
              >
                <Icons.help className="mr-2 h-4 w-4" />
                <span>{t('How to Use')}</span>
              </Button>
            </SidebarMenuItem>
            
            {/* プランページへのリンク */}
            <SidebarMenuItem>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/plans')}
              >
                <Icons.creditCard className="mr-2 h-4 w-4" />
                <span>{t('Plans')}</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Separator />
          <div className="p-2">
            <Button variant="secondary" onClick={() => setIsCreateEventOpen(true)} className="w-full">
              <Icons.plus className="mr-2 h-4 w-4" />
              {t('Create Event')}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <main
        className={mainContentClass}
        style={{
          transitionProperty: 'width, margin',
          transform: 'translateZ(0)',
          willChange: 'width, margin'
        }}
        aria-label="イベント一覧"
      >
        <h2 className="text-2xl font-bold tracking-tight">イベント一覧</h2>
        <EventList
          events={events}
          onDelete={deleteEvent}
          onReorder={handleReorderEvents}
        />
      </main>
      {/* フローティングアクションボタン・ダイアログ */}
      <Button
        className={
          cn(
            'fixed right-4 rounded-full w-12 h-12 shadow-lg z-50',
            // 無料プラン時はタブ＋広告バナー分だけ余白を増やす
            isPremium
              ? 'bottom-[60px] md:bottom-[100px]'
              : 'bottom-[110px] md:bottom-[150px]'
          )
        }
        onClick={() => setIsCreateEventOpen(true)}
      >
        <Icons.plus className="h-5 w-5" />
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
