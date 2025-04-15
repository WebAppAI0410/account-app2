'use client';

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import useTranslation from '@/hooks/use-translation'; // Import useTranslation

// Define the Event type (ensure this matches the type used elsewhere)
interface Event {
  id: string;
  name: string;
  date: string;
  description: string;
  collectionStartDate?: string;
  collectionEndDate?: string;
}

// Define the shape of the context data
interface EventsContextType {
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
  addEvent: (newEventData: Omit<Event, 'id'>) => void;
  deleteEvent: (eventId: string) => void;
  updateEvent: (eventId: string, updatedData: Partial<Omit<Event, 'id'>>) => void; // Add update function
}

// Create the context with a default value (can be undefined or null initially)
const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Helper function to format dates to YYYY/MM/DD format (copied from page.tsx)
const formatSimpleDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
};


// Create the Provider component
interface EventsProviderProps {
  children: ReactNode;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const { t } = useTranslation(); // Get translation function

  // Define initial state directly
   const initialEventsData: Event[] = [
    {
      id: '1',
      name: '飲み会', // Use direct string
      date: '2025/3/25', 
      description: '4/3の新歓用', // Use direct string
      collectionStartDate: '2025-03-25',
      collectionEndDate: '2025-04-03',
    },
  ];


  const [events, setEvents] = useState<Event[]>(initialEventsData);

  const addEvent = (newEventData: Omit<Event, 'id'>) => {
    const eventWithId: Event = {
      ...newEventData,
      id: String(Date.now()), // Simple ID generation
      // Ensure date is formatted correctly if not already provided
      date: newEventData.date || formatSimpleDate(new Date()),
    };
    setEvents((prevEvents) => [...prevEvents, eventWithId]);
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  };

  const updateEvent = (eventId: string, updatedData: Partial<Omit<Event, 'id'>>) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updatedData } : event
      )
    );
  };

  // Note: Reordering will be handled by directly calling setEvents in the component
  // after getting the new order from dnd-kit, so no specific reorder function needed here.

  return (
    <EventsContext.Provider value={{ events, setEvents, addEvent, deleteEvent, updateEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
