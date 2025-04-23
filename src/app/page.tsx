'use client';

import React, { useState } from 'react'; // Keep useState for local dialog state
import { useEvents } from '@/context/EventsContext'; // Import the context hook
import { useIsMobile } from '@/hooks/use-mobile'; // Import the mobile detection hook
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
} from '@/components/ui/sidebar';
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
    <SidebarProvider>
      <div className="flex h-screen relative">
        {/* Mobile hamburger menu button */}
        {isMobile && (
          <div className="fixed top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Find and use the setOpenMobile function from the sidebar context
                const sidebarContext = document.querySelector('[data-sidebar="sidebar"]');
                if (sidebarContext) {
                  // This will trigger the Sheet to open
                  const triggerButton = sidebarContext.parentElement?.querySelector('button');
                  triggerButton?.click();
                }
              }}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Icons.menu className="h-5 w-5" />
              <span className="sr-only">メニューを開く</span>
            </Button>
          </div>
        )}
        
        <Sidebar>
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

        <div className="flex-1 p-4 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">{t('Events')}</h2>
          {/* Pass context state and functions to EventList */}
          <EventList
            events={events} // From context
            onDelete={deleteEvent} // From context
            onReorder={handleReorderEvents} // Local handler using setEvents from context
          />
        </div>

        {/* Mobile floating action button for creating events - positioned above the ad banner */}
        {isMobile && (
          <Button
            className="fixed bottom-[70px] right-4 rounded-full w-12 h-12 shadow-lg z-50"
            onClick={() => setIsCreateEventOpen(true)}
          >
            <Icons.plus className="h-5 w-5" />
            <span className="sr-only">{t('Create Event')}</span>
          </Button>
        )}

        <EventCreateDialog
          open={isCreateEventOpen}
          onOpenChange={setIsCreateEventOpen}
          onEventCreated={handleCreateEvent} // Use the adapted handler
        />
      </div>
    </SidebarProvider>
  );
}
