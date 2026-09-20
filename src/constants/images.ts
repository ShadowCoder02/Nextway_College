export const IMAGES = {
  hero: "/images/hero-image.jpg",
  campus: "/images/nextway-college.jpg",
  brand: "/images/nextway.png",
  logo: "/brand/logo.png",
  logoIcon: "/brand/logo-icon.png",
  branchMap: "/images/sri-lanka-branch-map.jpeg",
  hybridCampus: "/images/hybrid-campus.png",
  onlineStudent: "/images/online-student.png",
} as const;

// Shared blur placeholder for the site's hero-style images (a 1x1 navy SVG)
// — all four sit on a navy background/overlay, so one placeholder suits
// them all rather than one hand-authored per page.
// Light neutral counterpart for card-style images that sit on a white/pearl
// surface (programme cards) — the navy one above would flash dark there.
export const CARD_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlOGVjZjIiLz48L3N2Zz4=";

export const HERO_BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwZjIzNDAiLz48L3N2Zz4=";
