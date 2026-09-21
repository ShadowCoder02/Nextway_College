"use client";

import { useEffect, useState } from "react";

const MAX = 3;
const MIN = 2;

/** Sticky bar for the programme-compare form. The checkboxes are plain
 * `<input name="p">` inside the same <form>, so the server route works with no
 * JS (and validates the selection itself); this island only adds the live
 * count, the 3-item cap and disabling the button until 2 are chosen. */
export function CompareBar({ formId }: { formId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const boxes = () => Array.from(form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="p"]'));
    const sync = () => {
      const checked = boxes().filter((b) => b.checked).length;
      setCount(checked);
      boxes().forEach((b) => {
        b.disabled = !b.checked && checked >= MAX;
      });
    };
    form.addEventListener("change", sync);
    sync();
    return () => form.removeEventListener("change", sync);
  }, [formId]);

  const ready = count >= MIN;
  return (
    <div className="sticky bottom-4 z-30 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white/95 px-5 py-3 shadow-premium backdrop-blur">
      <p role="status" className="text-sm text-charcoal">
        {count === 0 && "Tick “Compare” on 2 or 3 programmes to see them side by side."}
        {count === 1 && "Choose at least one more programme to compare."}
        {count >= MIN && `${count} programmes selected${count === MAX ? " (maximum)" : ""}.`}
      </p>
      <button
        type="submit"
        disabled={!ready}
        className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-deep-blue disabled:cursor-not-allowed disabled:opacity-50"
      >
        Compare selected
      </button>
    </div>
  );
}
