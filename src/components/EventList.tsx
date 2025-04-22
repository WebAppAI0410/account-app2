import React, { useState, useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import useTranslation from '@/hooks/use-translation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy, // Using vertical strategy, adjust grid layout if needed
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Keep the existing Event interface
interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  collectionStartDate?: string;
  collectionEndDate?: string;
}

// Add onDelete and onReorder to props
interface EventListProps {
  events: Event[];
  onDelete: (eventId: string) => void;
  onReorder: (events: Event[]) => void;
}

// Helper function to format dates to YYYY/MM/DD format
const formatSimpleDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    // Use getFullYear(), getMonth()+1 (since it's 0-indexed), and getDate()
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
  } catch (e) {
    return dateStr; // Return the original string if parsing fails
  }
};

// Create a Sortable Item component to wrap the Card
const SortableEventCard: React.FC<{ event: Event; onDelete: (id: string) => void; onViewDetails: (id: string) => void; listId: string }> = ({ event, onDelete, onViewDetails, listId }) => {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Use isDragging to style the item while being dragged
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Make item semi-transparent when dragging
    zIndex: isDragging ? 10 : 'auto', // Ensure dragging item is on top
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(event.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Make the header the drag handle */}
        <CardHeader {...listeners} className="cursor-move">
          <CardTitle>{event.name}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
          {/* Delete Button - Positioned top-right */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" // Show on hover
            onClick={handleDeleteClick}
            aria-label={t('Delete Event')}
          >
            <Icons.trash className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center text-sm text-muted-foreground">
            <Icons.calendar className="mr-2 h-4 w-4" />
            <span>{t('Creation Date')}: </span>
            {event.date ? event.date : <span>{t('Date not set')}</span>}
          </div>
          {(event.collectionStartDate || event.collectionEndDate) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Icons.calendar className="mr-2 h-4 w-4" />
              <span>{t('Collection Period')}: </span>
              {event.collectionStartDate ? formatSimpleDate(event.collectionStartDate) : t('N/A')}
              {' - '}
              {event.collectionEndDate ? formatSimpleDate(event.collectionEndDate) : t('N/A')}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => onViewDetails(event.id)} className="w-full">
            <Icons.arrowRight className="mr-2 h-4 w-4" />
            {t('View Details')}
          </Button>
        </CardFooter>
        {/* Add aria-describedby for accessibility */}
        <div aria-describedby={listId} />
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete Event')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Are you sure you want to delete this event?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</AlertDialogCancel> {/* Explicitly close on cancel */}
            <AlertDialogAction onClick={handleConfirmDelete}> {/* Ensure this calls the correct handler */}
              {t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


export const EventList: React.FC<EventListProps> = ({ events, onDelete, onReorder }) => {
  const router = useRouter();
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating
      // Or press and hold for 250ms
      activationConstraint: {
        distance: 10,
        delay: 250,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleViewDetails = (eventId: string) => {
    // Add debugging logs to track navigation
    console.log('Navigating to event details:', {
      eventId,
      eventIdType: typeof eventId,
      url: `/events/${eventId}`
    });

    // Make sure eventId is a string
    const eventIdString = String(eventId);
    router.push(`/events/${eventIdString}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);
      onReorder(arrayMove(events, oldIndex, newIndex));
    }
  };

  // Generate a unique ID for aria-describedby
  const listId = useMemo(() => `DndDescribedBy-${Math.random().toString(36).substring(2)}`, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={events.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" id={listId}>
          {events.map((event) => (
            <SortableEventCard
              key={event.id}
              event={event}
              onDelete={onDelete}
              onViewDetails={handleViewDetails}
              listId={listId} // Pass the listId to SortableEventCard
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
