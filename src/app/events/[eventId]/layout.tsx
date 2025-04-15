import React from 'react';

// generateStaticParams is required for static export of dynamic routes.
// Returning an empty array means no paths are pre-rendered at build time.
export async function generateStaticParams() {
  return [];
}

// Explicitly force static rendering for this route segment
export const dynamic = 'force-static';

// Basic layout component for the dynamic event segment
// It just passes children through.
export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
