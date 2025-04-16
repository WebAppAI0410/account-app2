import React from 'react';
import EventDetailsClient from './EventDetailsClient'; // Import the client component

// Define the expected shape of the params for this page
interface EventPageProps {
  params: {
    eventId: string;
  };
}

// Configuration moved to layout.tsx

// This is the main Server Component for the route
// It receives params and passes them down to the Client Component
const EventDetailPage: React.FC<EventPageProps> = ({ params }) => {
  // Log the params at the server component level to verify
  console.log('Server Component received params:', params);
  
  // Ensure the eventId is properly captured and passed
  const eventId = params.eventId;
  console.log('EventDetailPage extracted eventId:', eventId);
  
  // Render the Client Component, passing the params object
  return <EventDetailsClient params={{ eventId }} />;
};

export default EventDetailPage;
