'use client';

import React, { useState } from 'react';
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
}

const initialEventsData: Event[] = [
  { id: '1', name: 'Summer Party', date: '2024-08-15', description: 'Annual summer party' },
  { id: '2', name: 'Trip to Mountains', date: '2024-12-20', description: 'Winter trip to the mountains' },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>(initialEventsData); // Manage events in state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // Function to add a new event
  const addEvent = (newEvent: Omit<Event, 'id' | 'date'>) => {
    const eventWithId: Event = {
      ...newEvent,
      id: String(Date.now()), // Simple ID generation
      date: new Date().toISOString().split('T')[0], // Set current date as default
    };
    setEvents((prevEvents) => [...prevEvents, eventWithId]);
  };


  return (
    <SidebarProvider>
      <div className="flex h-screen">
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
          <EventList events={events} /> {/* Pass state variable */}
        </div>

        <EventCreateDialog
          open={isCreateEventOpen}
          onOpenChange={setIsCreateEventOpen}
          onEventCreated={addEvent} // Pass the addEvent function
        />
      </div>
    </SidebarProvider>
  );
}
