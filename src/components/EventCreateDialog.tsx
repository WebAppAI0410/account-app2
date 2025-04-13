import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useTranslation from '@/hooks/use-translation';

// Define the shape of the event data expected by the callback
interface NewEventData {
  name: string;
  description: string;
}

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (newEvent: NewEventData) => void; // Add prop for the callback
}

export const EventCreateDialog: React.FC<EventCreateDialogProps> = ({ open, onOpenChange, onEventCreated }) => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const { t } = useTranslation();

  const handleCreateEvent = () => {
    // Call the callback function passed from the parent
    onEventCreated({ name: eventName, description: eventDescription });
    // Reset form fields
    setEventName('');
    setEventDescription('');
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Trigger is handled by the parent component */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('Create New Event')}</DialogTitle>
          <DialogDescription>{t('Enter the details for the new event.')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('Event Name')}</Label>
            <Input
              id="name"
              placeholder={t('Event name')}
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full" // Adjusted class
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t('Event Description')}</Label>
            <Textarea
              id="description"
              placeholder={t('Event description')}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full" // Adjusted class
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('Cancel')}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleCreateEvent}>
            {t('Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
