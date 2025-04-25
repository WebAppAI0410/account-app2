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
const EventDetailPage = async (props: EventPageProps) => {
  // paramsをawaitして取得
  const { params } = props;
  const awaitedParams = await params;
  const eventId = awaitedParams.eventId;
  console.log('EventDetailPage extracted eventId:', eventId);
  // Render the Client Component, passing the params object
  return <EventDetailsClient params={{ eventId }} />;
};

export default EventDetailPage;
