import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import { getEvents } from "@/services/events";

export const metadata = buildMetadata({
  title: "Events",
  description: "Upcoming events, open days and information sessions at Nextway College International.",
  path: "/events",
});

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="container-nwc">
          <span className="eyebrow mb-3 block">Calendar</span>
          <h1 className="text-display text-white">Events</h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-nwc grid gap-8 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-soft)]">
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
          ))}
        </div>
      </section>
    </>
  );
}
