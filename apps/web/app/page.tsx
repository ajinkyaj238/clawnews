import { AnalyticalClawNewsApp } from "@/components/AnalyticalClawNewsApp";
import { getDailyBriefEvents } from "@/lib/event-data";

export const dynamic = "force-dynamic";

export default async function DailyBriefPage() {
  const events = await getDailyBriefEvents();

  return <AnalyticalClawNewsApp events={events} initialView="home" />;
}
