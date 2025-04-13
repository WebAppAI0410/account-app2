import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Icons.calendar className="mr-2 h-4 w-4" />
              {event.date ? format(new Date(event.date), 'PPP') : <span>{t('Date not set')}</span>}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleViewDetails(event.id)} className="w-full">
              <Icons.arrowRight className="mr-2 h-4 w-4" />
              {t('View Details')}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
