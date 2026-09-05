"use client";

import { isCommonPassword } from "@/lib/common-passwords";

type Rule = { label: string; met: (password: string) => boolean };

const RULES: Rule[] = [
  { label: "At least 8 characters", met: (p) => p.length >= 8 },
  { label: "At least one letter", met: (p) => /[A-Za-z]/.test(p) },
  { label: "At least one number", met: (p) => /[0-9]/.test(p) },
  { label: "Not a commonly used password", met: (p) => p.length > 0 && !isCommonPassword(p) },
];

/** Shown before the user types, then ticks off live as they type. */
export function PasswordPolicyChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1 text-xs" aria-live="polite">
      {RULES.map((rule) => {
        const met = password.length > 0 && rule.met(password);
        return (
          <li key={rule.label} className={met ? "text-success" : "text-slate"}>
            <span aria-hidden="true">{met ? "✓" : "○"}</span> {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
