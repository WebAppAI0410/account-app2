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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import useTranslation from '@/hooks/use-translation';
import { useAdMob } from '@/hooks/useAdMob';
import { Icons } from '@/components/icons';

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
  const { showInterstitial } = useAdMob();

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
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-lg border shadow-lg">
        <DialogHeader className="px-6 pt-6 pb-4 bg-background/60 backdrop-blur-[1px]">
          <DialogTitle className="text-2xl font-medium tracking-tight flex items-center gap-2">
            <Icons.calendar className="h-5 w-5 text-primary" />
            {t('Create New Event')}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground/80">
            {t('Enter the details for the new event.')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-5 px-6 bg-background/40 backdrop-blur-[1px]">
          <div className="grid gap-2">
            <Label htmlFor="name" className="font-medium">
              {t('Event Name')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t('Event name')}
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full transition-shadow focus-visible:shadow-sm"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-medium">
              {t('Event Description')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('Event description')}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full min-h-[100px] resize-y transition-shadow focus-visible:shadow-sm"
            />
          </div>
          
          {/* 日付選択フィールド - より洗練されたデザインに */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Collection Start Date */}
            <div className="grid gap-2">
              <Label htmlFor="collectionStartDate" className="font-medium">
                {t('Collection Start Date')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal transition-all',
                      'hover:border-primary/30',
                      !collectionStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
                    {collectionStartDate ? (
                      <span className="opacity-90">{format(collectionStartDate, 'PPP')}</span>
                    ) : (
                      <span>{t('Pick a date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-md border-muted/50">
                  <Calendar
                    mode="single"
                    selected={collectionStartDate}
                    onSelect={setCollectionStartDate}
                    initialFocus
                    disabled={(date) => 
                      collectionEndDate ? date > collectionEndDate : false
                    }
                    className="rounded-md border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Collection End Date */}
            <div className="grid gap-2">
              <Label htmlFor="collectionEndDate" className="font-medium">
                {t('Collection End Date')}
              </Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal transition-all',
                      'hover:border-primary/30',
                      !collectionEndDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-secondary/70" />
                    {collectionEndDate ? (
                      <span className="opacity-90">{format(collectionEndDate, 'PPP')}</span>
                    ) : (
                      <span>{t('Pick a date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 shadow-md border-muted/50">
                  <Calendar
                    mode="single"
                    selected={collectionEndDate}
                    onSelect={setCollectionEndDate}
                    initialFocus
                    disabled={(date) => 
                      collectionStartDate ? date < collectionStartDate : false
                    }
                    className="rounded-md border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-background/80 border-t flex justify-between sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              {t('Cancel')}
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleCreateEvent} 
            disabled={!eventName}
            className={cn(
              "w-full sm:w-auto transition-all",
              eventName ? "shadow-sm hover:shadow" : ""
            )}
          >
            <Icons.plus className="mr-2 h-4 w-4" />
            {t('Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
