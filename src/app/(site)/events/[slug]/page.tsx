import Image from "next/image";
import { notFound } from "next/navigation";
import { buildMetadata, eventJsonLd } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import { LeadForm } from "@/components/ui/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getEventBySlug } from "@/services/events";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { getStoredEvents } = await import("@/lib/cms/store");
  const events = await getStoredEvents();
  return events.filter((e) => e.status === "published").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return buildMetadata({
    title: event.title,
    description: event.summary,
    path: `/events/${event.slug}`,
    image: event.imageUrl,
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            eventJsonLd({
              title: event.title,
              description: event.description,
              slug: event.slug,
              startAt: event.startAt,
              location: event.location,
              imageUrl: event.imageUrl,
            }),
          ),
        }}
      />
      <Breadcrumbs items={[{ label: "News & Events", href: "/events" }, { label: event.title, href: `/events/${event.slug}` }]} />
      <section className="relative bg-navy py-16 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={event.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwZjIzNDAiLz48L3N2Zz4="
          />
        </div>
        <div className="container-nwc relative max-w-3xl">
          <p className="mb-3 text-sm text-gold">{formatDateTime(event.startAt)} · {event.location}</p>
          <h1 className="text-display text-white">{event.title}</h1>
        </div>
      </section>

      <div className="container-nwc grid gap-12 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-lg text-charcoal">{event.description}</p>
        </div>
        <aside>
          <div className="rounded-[var(--radius-card)] bg-ice p-6">
            <h2 className="mb-4 font-bold">Register interest</h2>
            <LeadForm source={`event-${event.slug}`} compact />
          </div>
        </aside>
      </div>
    </>
  );
}
