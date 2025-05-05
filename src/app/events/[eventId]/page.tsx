import { Metadata } from 'next';
import EventDetailsClient from './EventDetailsClient'; // Import the client component

// Define the page props type using Next.js conventions
type Props = {
  params: { eventId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// This is the main Server Component for the route
export default function EventDetailPage({ params }: Props) {
  const eventId = params.eventId;
  
  // Render the Client Component, passing the params object
  return <EventDetailsClient params={{ eventId }} />;
}
