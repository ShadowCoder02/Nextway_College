"use client";

import { useEffect } from "react";
import { rememberProgrammeSlug } from "@/lib/applicant-programme";

/** Writes an already-validated programme slug to sessionStorage on mount. */
export function RememberProgramme({ slug }: { slug: string }) {
  useEffect(() => {
    rememberProgrammeSlug(slug);
  }, [slug]);

  return null;
}
