import { isCommonPassword } from "@/lib/common-passwords";

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
};

/**
 * A lightweight heuristic scorer, not zxcvbn — zxcvbn's dictionary bundle
 * (400KB+) works against this project's own stated goal of a light bundle
 * for mid-range Android on 4G. This scores on length, character-class
 * variety and the common-password blocklist instead.
 */
export function scorePasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "Very weak" };

  if (isCommonPassword(password)) {
    return { score: 0, label: "Very weak" };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (password.length >= 16) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  const score = Math.min(4, Math.floor(points / 1.5)) as PasswordStrength["score"];
  const labels: PasswordStrength["label"][] = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}
