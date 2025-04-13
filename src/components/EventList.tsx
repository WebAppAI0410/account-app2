import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import useTranslation from '@/hooks/use-translation';

interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
}

interface EventListProps {
  events: Event[];
}

export const EventList: React.FC<EventListProps> = ({ events }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  return (
    <div className="divide-y divide-border">
      {events.map((event) => (
        <div key={event.id} className="flex items-center justify-between py-4">
          <div>
            <h3 className="text-lg font-semibold">{event.name}</h3>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('justify-start text-left font-normal', !event.date && 'text-muted-foreground')}>
                  <Icons.calendar className="mr-2 h-4 w-4" />
                  {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : <span>{t('Pick a date')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar mode="single" selected={event.date ? new Date(event.date) : undefined} onSelect={() => {}} />
              </PopoverContent>
            </Popover>
            <Button onClick={() => handleViewDetails(event.id)}>View Details</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
