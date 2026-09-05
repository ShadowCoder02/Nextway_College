"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set — safe to
 * mount unconditionally. Requires a Cloudflare Turnstile site key/secret
 * pair to actually activate (see src/lib/turnstile.ts for the server half).
 */
export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let widgetId: string | undefined;
    let scriptEl: HTMLScriptElement | null = null;

    function renderWidget() {
      if (window.turnstile && containerRef.current) {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey as string,
          callback: onVerify,
        });
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      scriptEl = document.createElement("script");
      scriptEl.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      scriptEl.async = true;
      scriptEl.onload = renderWidget;
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <div>
      <div ref={containerRef} />
      <p className="mt-1 text-xs text-slate">Please complete the verification challenge to continue.</p>
    </div>
  );
}
