/**
 * A small blocklist of widely-known breached/common passwords (public data —
 * these are the same ~200 entries that top every published breach-frequency
 * list, e.g. rockyou-derived top-password sets). Not exhaustive; paired with
 * a cheap structural check for sequential/repeated-character passwords that
 * wouldn't otherwise appear in a short static list.
 */
const COMMON_PASSWORDS = new Set(
  [
    "123456", "password", "123456789", "12345678", "12345", "1234567",
    "1234567890", "qwerty", "abc123", "111111", "123123", "admin",
    "letmein", "welcome", "monkey", "login", "princess", "qwertyuiop",
    "solo", "passw0rd", "starwars", "dragon", "master", "hello",
    "freedom", "whatever", "qazwsx", "trustno1", "654321", "jordan23",
    "harley", "password1", "1234", "12345", "iloveyou", "1q2w3e4r",
    "000000", "1qaz2wsx", "zaq1zaq1", "sunshine", "football", "shadow",
    "michael", "ashley", "qwerty123", "666666", "superman", "1qaz2wsx3edc",
    "121212", "flower", "hottie", "loveme", "zaq12wsx", "password123",
    "7777777", "654321", "michelle", "tigger", "sunshine1", "chocolate",
    "cheese", "computer", "batman", "jessica", "ginger", "hunter",
    "buster", "soccer", "hockey", "killer", "george", "sexy",
    "andrew", "charlie", "asshole", "fuckyou", "dallas", "jennifer",
    "amanda", "summer", "internet", "banana", "hannah", "nicole",
    "daniel", "richard", "matthew", "yankees", "test", "biteme",
    "thomas", "cookie", "hardcore", "666666", "smokey", "captain",
    "swimming", "silver", "william", "diamond", "corvette", "melissa",
    "eagle1", "peanut", "orange", "aaaaaa", "chelsea", "coffee",
    "bulldog", "guitar", "mercedes", "jackson", "phoenix", "camaro",
    "sophie", "cameron", "spider", "purple", "canada", "blahblah",
    "genesis", "jasmine", "gemini", "apples", "california", "12341234",
    "sparky", "yellow", "sabrina", "cowboys", "iloveu", "iloveme",
    "welcome1", "monkey1", "dragon1", "ncc1701", "abcd1234", "changeme",
    "letme in", "newpassword", "qwerty1", "1qazxsw2", "abcdefgh", "abcdefg",
    "password12", "nextway", "nextwaycollege", "kandy", "srilanka",
  ].map((p) => p.toLowerCase()),
);

function hasNoVariety(lower: string): boolean {
  // All the same character (e.g. "aaaaaaaa", "11111111")
  if (/^(.)\1+$/.test(lower)) return true;

  // Fully sequential ascending/descending digits or letters, e.g.
  // "12345678", "87654321", "abcdefgh"
  const isSequential = (str: string, step: number) =>
    [...str].every((ch, i) => i === 0 || ch.charCodeAt(0) === str.charCodeAt(i - 1) + step);
  if (lower.length >= 5 && (isSequential(lower, 1) || isSequential(lower, -1))) return true;

  return false;
}

export function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_PASSWORDS.has(lower) || hasNoVariety(lower);
}
