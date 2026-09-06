export interface Branch {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  hours?: string;
}

// TODO(content): SITE.description and marketing copy claim "22 branches
// island-wide," but only these 7 town names have ever been recorded
// anywhere in the codebase — no addresses, phone numbers or hours exist
// for any of them. The college must supply: (1) the other 15 branch
// names, and (2) address/phone/hours for all 22. Never invent these.
export const BRANCHES: Branch[] = [
  { name: "Kandy", slug: "kandy" },
  { name: "Colombo", slug: "colombo" },
  { name: "Galle", slug: "galle" },
  { name: "Batticaloa", slug: "batticaloa" },
  { name: "Kegalle", slug: "kegalle" },
  { name: "Kurunegala", slug: "kurunegala" },
  { name: "Kalutara", slug: "kalutara" },
];
