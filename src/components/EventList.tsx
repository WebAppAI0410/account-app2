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
  verticalListSortingStrategy,
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
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(event.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        className={cn(
          "relative group border-muted/40",
          "transition-all duration-300 ease-in-out",
          "hover:border-primary/20 hover:shadow-md",
          "backdrop-blur-[1px]",
          isDragging ? "rotate-1 scale-[1.02] shadow-lg" : ""
        )}
      >
        {/* ドラッグハンドル - より洗練された外観に */}
        <CardHeader {...listeners} className="cursor-move pb-3">
          <div className="absolute top-3 left-3 opacity-30 group-hover:opacity-70 transition-opacity">
            <Icons.gripVertical className="h-4 w-4" />
          </div>
          
          <div className="pl-6">
            <CardTitle className="text-xl font-medium tracking-tight">{event.name}</CardTitle>
            <CardDescription className="mt-1.5 line-clamp-2">{event.description}</CardDescription>
          </div>
          
          {/* 削除ボタン - 右上に配置し、ホバー時に表示 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDeleteClick}
            aria-label={t('Delete Event')}
          >
            <Icons.trash className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="mb-2.5 flex items-center text-sm text-muted-foreground">
            <Icons.calendar className="mr-2 h-4 w-4 text-primary/70" />
            <span className="font-medium mr-1">{t('Creation Date')}: </span>
            {event.date ? <span className="opacity-90">{event.date}</span> : <span className="italic opacity-60">{t('Date not set')}</span>}
          </div>
          
          {(event.collectionStartDate || event.collectionEndDate) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Icons.calendar className="mr-2 h-4 w-4 text-secondary/70" />
              <span className="font-medium mr-1">{t('Collection Period')}: </span>
              <span className="opacity-90">
                {event.collectionStartDate ? formatSimpleDate(event.collectionStartDate) : t('N/A')}
                {' - '}
                {event.collectionEndDate ? formatSimpleDate(event.collectionEndDate) : t('N/A')}
              </span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button 
            onClick={() => onViewDetails(event.id)} 
            className="w-full shadow-sm group relative overflow-hidden"
            variant="default"
          >
            <span className="relative z-10 flex items-center">
              {t('View Details')}
              <Icons.arrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </CardFooter>
        
        <div aria-describedby={listId} />
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">{t('Delete Event')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Are you sure you want to delete this event?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" id={listId}>
          {events.length > 0 ? (
            events.map((event) => (
              <SortableEventCard
                key={event.id}
                event={event}
                onDelete={onDelete}
                onViewDetails={handleViewDetails}
                listId={listId}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <Icons.calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-muted-foreground/70 mb-2">{t('No Events Yet')}</h3>
              <p className="text-muted-foreground/60 max-w-xs">{t('Create your first event to get started')}</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
