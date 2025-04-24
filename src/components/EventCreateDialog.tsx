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
import { Calendar } from '@/components/ui/calendar'; // Import Calendar if needed for date picking, or just use Input type="date"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // For Calendar popover
import { CalendarIcon } from 'lucide-react'; // Icon for date picker trigger
import { format } from 'date-fns'; // For formatting dates
import { cn } from '@/lib/utils'; // Utility for class names
import useTranslation from '@/hooks/use-translation';
import { useAdMob } from '@/hooks/useAdMob'; // Import the AdMob hook

// Define the shape of the event data expected by the callback
// Use string for dates to avoid timezone issues during transfer
interface NewEventData {
  name: string;
  description: string;
  collectionStartDate?: string; 
  collectionEndDate?: string;   
}

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (newEvent: NewEventData) => void; // Add prop for the callback
}

export const EventCreateDialog: React.FC<EventCreateDialogProps> = ({ open, onOpenChange, onEventCreated }) => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [collectionStartDate, setCollectionStartDate] = useState<Date | undefined>(undefined);
  const [collectionEndDate, setCollectionEndDate] = useState<Date | undefined>(undefined);
  const { t } = useTranslation();
  const { showInterstitial } = useAdMob(); // Get the interstitial function

  const handleCreateEvent = async () => { // Make the function async
    if (!eventName) {
      // Basic validation: Ensure event name is not empty
      // You might want to add more robust validation/feedback here
      alert(t('Event name is required.')); // Simple alert, consider using a toast or form validation library
      return;
    }
    // Call the callback function passed from the parent
    onEventCreated({
      name: eventName,
      description: eventDescription,
      // Format dates to YYYY-MM-DD string safely to avoid timezone issues
      collectionStartDate: collectionStartDate ? format(collectionStartDate, 'yyyy-MM-dd') : undefined,
      collectionEndDate: collectionEndDate ? format(collectionEndDate, 'yyyy-MM-dd') : undefined,
    });

    // Attempt to show interstitial ad *after* successful creation logic
    // but *before* resetting form and closing dialog
    let adDisplayed = false;
    try {
      adDisplayed = await showInterstitial(); // Now returns boolean indicating success
      if (adDisplayed) {
        console.log('Interstitial ad displayed after event creation');
      } else {
        console.log('Interstitial ad not displayed (skipped or unavailable)');
      }
    } catch (error) {
      console.error("Failed to show interstitial ad:", error);
      // We continue with form reset and dialog closing regardless of ad success
    }

    // Reset form fields
    setEventName('');
    setEventDescription('');
    setCollectionStartDate(undefined);
    setCollectionEndDate(undefined);
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
            <Label htmlFor="name">
              {t('Event Name')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t('Event name')}
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full" // Adjusted class
              required // Make event name required
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
          {/* Collection Start Date */}
          <div className="grid gap-2">
            <Label htmlFor="collectionStartDate">{t('Collection Start Date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !collectionStartDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {collectionStartDate ? format(collectionStartDate, 'PPP') : <span>{t('Pick a date')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={collectionStartDate}
                  onSelect={setCollectionStartDate}
                  initialFocus
                  disabled={(date) => // Disable dates after the end date
                    collectionEndDate ? date > collectionEndDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Collection End Date */}
          <div className="grid gap-2">
            <Label htmlFor="collectionEndDate">{t('Collection End Date')}</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !collectionEndDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {collectionEndDate ? format(collectionEndDate, 'PPP') : <span>{t('Pick a date')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={collectionEndDate}
                  onSelect={setCollectionEndDate}
                  initialFocus
                  disabled={(date) => // Disable dates before the start date
                    collectionStartDate ? date < collectionStartDate : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t('Cancel')}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleCreateEvent} disabled={!eventName}> {/* Disable button if name is empty */}
            {t('Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
