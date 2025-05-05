import EventDetailsClient from './EventDetailsClient'; // Import the client component

// This is the main Server Component for the route
export default function EventDetailPage({ 
  params 
}: { 
  params: { eventId: string } 
}) {
  const eventId = params.eventId;
  
  // Render the Client Component, passing the params object
  return <EventDetailsClient params={{ eventId }} />;
}
