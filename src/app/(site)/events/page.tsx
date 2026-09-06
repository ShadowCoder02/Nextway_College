import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatDateTime } from "@/lib/utils";
import { getUpcomingEvents, getPastEvents } from "@/services/events";
import type { EventItem } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "Events",
  description: "Upcoming events, open days and information sessions at Nextway College International.",
  path: "/events",
});

function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-soft)]">
      <div className="relative aspect-[16/9]">
        <Image src={event.imageUrl} alt="" fill className="object-cover" sizes="50vw" />
      </div>
      <div className="p-6">
        <p className="mb-2 text-sm font-medium text-deep-blue">{formatDateTime(event.startAt)}</p>
        <h2 className="mb-2 text-xl font-bold">
          <Link href={`/events/${event.slug}`} className="hover:text-deep-blue">
            {event.title}
          </Link>
        </h2>
        <p className="mb-2 text-slate">{event.summary}</p>
        <p className="text-sm text-charcoal">{event.location}</p>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Events", href: "/events" }]} />
      <section className="bg-navy py-16 text-white">
        <div className="container-nwc">
          <span className="eyebrow mb-3 block">Calendar</span>
          <h1 className="text-display text-white">Events</h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-nwc space-y-16">
          <div>
            <h2 className="text-section mb-8">Upcoming events</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                heading="No upcoming events are scheduled right now"
                body="Check back soon, or browse our programmes in the meantime."
                action={<Button href="/programmes" variant="secondary">Browse Programmes</Button>}
              />
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-section mb-8">Past events</h2>
            {past.length === 0 ? (
              <EmptyState heading="No past events to show yet" />
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
