
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventCreateDialog: React.FC<EventCreateDialogProps> = ({ open, onOpenChange }) => {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const handleCreateEvent = () => {
    // Add event creation logic here
    console.log('Creating event:', { name: eventName, description: eventDescription });
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {/* This trigger is not visible, it's triggered from the parent component */}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Create New Event</AlertDialogTitle>
        <AlertDialogDescription>Enter the details for the new event.</AlertDialogDescription>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              placeholder="Event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              placeholder="Event description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <AlertDialogAction onClick={handleCreateEvent}>Create</AlertDialogAction>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
};
