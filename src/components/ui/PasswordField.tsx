"use client";

import { useId, useState } from "react";
import { scorePasswordStrength } from "@/lib/password-strength";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showStrength?: boolean;
};

const STRENGTH_COLORS = ["bg-error", "bg-error", "bg-gold", "bg-deep-blue", "bg-success"];

export function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  required,
  error,
  showStrength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strengthMeterId = useId();
  const strength = showStrength ? scorePasswordStrength(value) : null;

  const inputClass =
    "w-full rounded-lg border border-slate/30 bg-white px-4 py-3 pr-16 text-charcoal text-sm placeholder:text-slate/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold uppercase tracking-wider text-navy">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : showStrength ? strengthMeterId : undefined}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-bold text-navy/70 hover:text-navy"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {showStrength && value && strength && (
        <div id={strengthMeterId} className="mt-2">
          <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded bg-slate/15">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-full flex-1 rounded transition-colors ${
                  i <= strength.score ? STRENGTH_COLORS[strength.score] : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-slate">Password strength: {strength.label}</p>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
