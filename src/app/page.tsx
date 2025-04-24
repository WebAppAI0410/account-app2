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
  
  // Create conditional class for main content based on sidebar state
  // メインコンテンツのクラス - React.useMemoを使用して不要な再計算を防止
  const mainContentClass = React.useMemo(() => {
    return cn(
      // ベースクラス
      "flex-1 p-4 space-y-4",
      
      // 幅の制御（サイドバーの状態に応じて変更）
      "transition-all duration-300 ease-in-out",
      
      // タブレット特有のスタイリング - 幅を調整
      isTablet && "tablet:w-full",
      isTablet && state === "expanded" && "tablet:w-[calc(100%-var(--sidebar-width))]",
      
      // デスクトップ特有のスタイリング - 幅を調整
      isDesktop && "desktop:w-full",
      isDesktop && state === "expanded" && "desktop:w-[calc(100%-var(--sidebar-width))]",
      
      // 最大幅を設定して、コンテンツが広がりすぎないようにする
      "max-w-full"
    );
  }, [isMobile, isTablet, isDesktop, state]);

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
      <div className="flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Hamburger menu button - displayed on all devices */}
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
            // インラインスタイルでトランジション対象を明示
            transitionProperty: 'width, margin',
            // GPUアクセラレーションを活用
            transform: 'translateZ(0)',
            // ブラウザに変更を予告
            willChange: 'width, margin'
          }}
          aria-label={t('Events')}
        >
          <h2 className="text-2xl font-bold tracking-tight">{t('Events')}</h2>
          {/* Pass context state and functions to EventList */}
          <EventList
            events={events} // From context
            onDelete={deleteEvent} // From context
            onReorder={handleReorderEvents} // Local handler using setEvents from context
          />
        </main>

        {/* Floating action button for creating events - positioned above the ad banner */}
        <Button
            className="fixed bottom-[70px] right-4 rounded-full w-12 h-12 shadow-lg z-50"
            onClick={() => setIsCreateEventOpen(true)}
          >
            <Icons.plus className="h-5 w-5" />
            <span className="sr-only">{t('Create Event')}</span>
        </Button>

        <EventCreateDialog
          open={isCreateEventOpen}
          onOpenChange={setIsCreateEventOpen}
          onEventCreated={handleCreateEvent} // Use the adapted handler
        />
      </div>
    );
}
