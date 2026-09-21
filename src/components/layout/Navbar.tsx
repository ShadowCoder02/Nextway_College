"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { PRIMARY_NAV, type PrimaryNavItem } from "@/constants/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { cn } from "@/lib/utils";
import { afterLoad } from "@/components/motion/use-in-view";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

type SchoolLink = { slug: string; name: string };
type Group = Extract<PrimaryNavItem, { children: unknown }>;

const isGroup = (item: PrimaryNavItem): item is Group => "children" in item;
const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

const underline = (active: boolean) =>
  cn(
    "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand-red transition-transform duration-300 ease-out",
    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
  );

const linkClass = (active: boolean) =>
  cn(
    "group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active ? "text-brand-red" : "text-charcoal hover:text-navy",
  );

/** Disclosure-style dropdown: opens on click/Enter/Space (never hover-only),
 * closes on Escape (focus returns to the button), outside click, or when
 * focus leaves it. Mouse users also get hover-open. */
function NavDropdown({ item, pathname }: { item: Group; pathname: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  // A mouse user's pointer-enter opens the menu; the click that follows must
  // keep it open rather than toggling it shut. Keyboard/touch clicks toggle.
  const openedByHover = useRef(false);
  const active = item.children.some((c) => isActive(pathname, c.href));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        openedByHover.current = true;
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        openedByHover.current = false;
        setOpen(false);
      }}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={linkClass(active)}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            setOpen(true);
            return;
          }
          setOpen((v) => !v);
        }}
      >
        {item.label}
        <FontAwesomeIcon icon={faChevronDown} className={cn("h-3 w-3 transition-transform", open && "rotate-180")} aria-hidden="true" />
        <span aria-hidden="true" className={underline(active || open)} />
      </button>
      {open && (
        <ul
          id={menuId}
          className="absolute left-0 top-full z-50 mt-2 w-72 rounded-[var(--radius-card)] border border-navy/10 bg-white p-2 shadow-premium"
        >
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                aria-current={isActive(pathname, child.href) ? "page" : undefined}
                className="block rounded-xl px-4 py-3 transition hover:bg-ice focus-visible:bg-ice"
              >
                <span className="block text-sm font-semibold text-navy">{child.label}</span>
                <span className="block text-xs text-slate">{child.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export function Navbar({ schools }: { schools: SchoolLink[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Warm only the routes visitors are most likely to open next, and only once
  // the page has loaded and the browser is idle — eagerly prefetching all ten
  // nav routes at mount (RSC payloads + route JS, ~130kB) competed with the
  // hero image on a 4G phone. Skipped entirely on Data Saver / 2G-3G links.
  // Desktop nav <Link>s in the viewport are still prefetched by Next itself.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? "")) return;
    return afterLoad(() => {
      ["/programmes", "/admissions", "/apply"].forEach((route) => router.prefetch(route));
    });
  }, [router]);

  // Mobile menu: focus trap + Escape, and the page behind it can't scroll.
  useFocusTrap(open, panelRef, { onEscape: () => setOpen(false), returnTo: toggleButtonRef });
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav shadow-sm" : "border-b border-navy/5 bg-white",
      )}
    >
      <div className="container-nwc flex h-[var(--header-height)] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center lg:flex" aria-label="Main navigation">
          <ul className="flex items-center gap-0.5">
            {PRIMARY_NAV.map((item) =>
              isGroup(item) ? (
                <NavDropdown key={item.label} item={item} pathname={pathname} />
              ) : (
                <li key={item.href}>
                  <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} className={linkClass(isActive(pathname, item.href))}>
                    {item.label}
                    <span aria-hidden="true" className={underline(isActive(pathname, item.href))} />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchDialog schools={schools} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-navy/15 bg-white px-3 text-sm font-medium text-navy transition hover:border-brand-red hover:text-brand-red xl:px-4" />
          <div className="hidden lg:block">
            <Button href="/apply" variant="primary" size="sm" magnetic>
              Apply Online
            </Button>
          </div>
          <button
            ref={toggleButtonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/10 bg-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-haspopup="dialog"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="absolute inset-0 bg-navy/50" aria-hidden="true" />
          <div
            id="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-y-0 right-0 flex w-[min(24rem,100%)] flex-col overflow-y-auto overscroll-contain bg-white shadow-premium"
            data-lenis-prevent
          >
            <div className="flex h-[var(--header-height)] shrink-0 items-center justify-between border-b border-navy/5 px-5">
              <span className="font-heading text-lg font-semibold text-navy">Menu</span>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/10"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="block rounded-xl px-4 py-3.5 font-medium hover:bg-ice">
                    Home
                  </Link>
                </li>
                {PRIMARY_NAV.map((item) =>
                  isGroup(item) ? (
                    <li key={item.label}>
                      <p className="px-4 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate">{item.label}</p>
                      <ul className="space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={isActive(pathname, child.href) ? "page" : undefined}
                              className="block rounded-xl px-4 py-3 font-medium hover:bg-ice"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive(pathname, item.href) ? "page" : undefined}
                        className="block rounded-xl px-4 py-3.5 font-medium hover:bg-ice"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
            <div className="shrink-0 border-t border-navy/5 p-5">
              <Button href="/apply" variant="primary" className="w-full">
                Apply Online
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
