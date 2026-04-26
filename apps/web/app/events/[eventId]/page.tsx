import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnalyticalClawNewsApp } from "@/components/AnalyticalClawNewsApp";
import { getDailyBriefEvents, getEventById } from "@/lib/event-data";

interface EventDetailPageProps {
  params: {
    eventId: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: EventDetailPageProps): Promise<Metadata> {
  const event = await getEventById(params.eventId);

  if (!event) {
    return {
      title: "Event not found"
    };
  }

  return {
    description: event.summary,
    title: event.title
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventById(params.eventId);

  if (!event) {
    return notFound();
  }

  const events = await getDailyBriefEvents();

  return (
    <AnalyticalClawNewsApp
      events={events}
      initialEventId={event.id}
      initialView="event"
    />
  );
}
