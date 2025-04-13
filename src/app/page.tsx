
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

const eventsData = [
  { id: '1', name: 'Summer Party', date: '2024-08-15', description: 'Annual summer party' },
  { id: '2', name: 'Trip to Mountains', date: '2024-12-20', description: 'Winter trip to the mountains' },
];

export default function Home() {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center space-x-2">
              <Icons.coins className="h-6 w-6" />
              <h4 className="font-semibold text-md">EventBalance</h4>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarTrigger>
                  <Icons.list className="mr-2 h-4 w-4" />
                  <span>Events</span>
                </SidebarTrigger>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Separator />
            <div className="p-2">
              <Button variant="secondary" onClick={() => setIsCreateEventOpen(true)} className="w-full">
                <Icons.plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <EventList events={eventsData} />
            </CardContent>
          </Card>
        </div>

        <EventCreateDialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen} />
      </div>
    </SidebarProvider>
  );
}
