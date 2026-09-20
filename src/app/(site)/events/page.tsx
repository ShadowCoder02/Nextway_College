import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHero } from "@/components/ui/PageHero";
import { formatDateTime, whatsappUrl } from "@/lib/utils";
import { SITE } from "@/constants/site";
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
        <Image src={event.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 620px" />
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
      <PageHero eyebrow="Calendar" title="Events" />

      <section className="py-16 lg:py-24">
        <div className="container-nwc space-y-16">
          <div>
            <h2 className="text-section mb-8">Upcoming events</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                heading="No upcoming events are scheduled right now"
                body="Ask Admissions about upcoming open days and information sessions — or explore our programmes while you wait."
                action={
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Button href="/contact" variant="primary">Ask Admissions</Button>
                    <a
                      href={whatsappUrl(SITE.whatsapp, "Hello Nextway College, please let me know about upcoming events and open days.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-navy underline underline-offset-2 hover:text-brand-red"
                    >
                      Message us on WhatsApp
                    </a>
                    <Link
                      href="/programmes"
                      className="text-sm font-semibold text-navy underline underline-offset-2 hover:text-brand-red"
                    >
                      Browse programmes
                    </Link>
                  </div>
                }
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
