import type { Programme } from "@/types";
import { IMAGES } from "@/constants/images";

const seedImages = [IMAGES.hero, IMAGES.campus, IMAGES.brand] as const;

const img = (id: string) => {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return seedImages[seed % seedImages.length];
};

function baseProgramme(
  partial: Partial<Programme> & Pick<Programme, "id" | "title" | "slug" | "level" | "shortPitch">,
): Programme {
  return {
    schoolId: partial.schoolId ?? "sch-general",
    schoolSlug: partial.schoolSlug ?? "general",
    schoolName: partial.schoolName ?? "Nextway College International",
    duration: partial.duration ?? "As per programme structure",
    mode: partial.mode ?? "Hybrid",
    medium: partial.medium ?? "English & Tamil",
    intake: partial.intake ?? "2026 Intake",
    location: partial.location ?? "All island — 22 branches",
    overview: partial.overview ?? partial.shortPitch,
    whyThisProgramme: partial.whyThisProgramme ?? partial.shortPitch,
    learningOutcomes: partial.learningOutcomes ?? [
      "Build professional knowledge aligned with industry and academic standards",
      "Apply learning through online and direct hybrid sessions",
      "Develop confidence for career progression and further study",
    ],
    entryRequirements: partial.entryRequirements ?? [
      "GCE O/L or A/L or equivalent qualification as approved by the College",
      "English and/or Tamil medium suitability for the selected programme",
      "Admissions counselling may apply",
    ],
    assessment: partial.assessment ?? "Coursework, examinations and practical assessments as per module outlines.",
    careerOpportunities: partial.careerOpportunities ?? [
      "Career pathways related to the programme field",
      "Further academic progression where eligible",
    ],
    progression: partial.progression ?? "Progression to advanced study or professional pathways subject to partner requirements.",
    faqs: partial.faqs ?? [],
    imageUrl: partial.imageUrl ?? img("1523050854058-8df90110c9f1"),
    featured: partial.featured ?? false,
    flagship: partial.flagship ?? false,
    status: partial.status ?? "published",
    modules: partial.modules ?? [],
    ...partial,
  };
}

export const programmesSeed: Programme[] = [
  baseProgramme({
    id: "prog-bsc-it",
    title: "BSc Information Technology",
    slug: "bsc-information-technology",
    level: "Degree",
    duration: "3 years",
    medium: "English",
    shortPitch: "Flagship computing degree with hybrid delivery for modern IT careers.",
    featured: true,
    flagship: true,
    imageUrl: img("1517694712202-14dd9538aa97"),
    careerOpportunities: ["Software support", "Web technology", "IT operations", "Further IT study"],
  }),
  baseProgramme({
    id: "prog-llb",
    title: "LLB Bachelors of Law",
    slug: "llb-bachelors-of-law",
    level: "Degree",
    duration: "3–4 years",
    shortPitch: "Undergraduate law degree pathway for legal and professional careers.",
    featured: true,
    imageUrl: img("1589829545856-d10d557cf95f"),
    careerOpportunities: ["Legal practice support", "Corporate compliance", "Public sector roles"],
  }),
  baseProgramme({
    id: "prog-ba-geo",
    title: "BA Geography (SP)",
    slug: "ba-geography-sp",
    level: "Degree",
    shortPitch: "Special degree in Geography with structured hybrid learning.",
    imageUrl: img("1469474968028-56623f02e42e"),
  }),
  baseProgramme({
    id: "prog-ba-pol",
    title: "BA Political Science (SP)",
    slug: "ba-political-science-sp",
    level: "Degree",
    shortPitch: "Special degree exploring governance, policy and political systems.",
    imageUrl: img("1529107384806-3a0a4a0a0a0a"),
  }),
  baseProgramme({
    id: "prog-hnd-primary",
    title: "HND in Primary Education",
    slug: "hnd-primary-education",
    level: "Higher Diploma",
    shortPitch: "Higher diploma preparing educators for primary teaching environments.",
    featured: true,
    imageUrl: img("1503676260728-1c00da094a0b"),
  }),
  baseProgramme({
    id: "prog-hnd-english",
    title: "HND in English",
    slug: "hnd-english",
    level: "Higher Diploma",
    medium: "English",
    shortPitch: "Advanced English pathway for academic and professional communication.",
    imageUrl: img("1456513080800-b6bbe9059811"),
  }),
  baseProgramme({
    id: "prog-ba-tamil",
    title: "BA Tamil (SP)",
    slug: "ba-tamil-sp",
    level: "Degree",
    medium: "Tamil",
    shortPitch: "Special degree in Tamil language, literature and applied communication.",
    imageUrl: img("1546410535-e1343712f4a0"),
  }),
  baseProgramme({
    id: "prog-hnd-law",
    title: "HND in Law",
    slug: "hnd-law",
    level: "Higher Diploma",
    shortPitch: "Practical legal studies foundation for degree progression or workplace roles.",
    imageUrl: img("1589391887882-d48ac6a50f04"),
  }),
  baseProgramme({
    id: "prog-dip-preschool",
    title: "Diploma in Preschool",
    slug: "diploma-preschool",
    level: "Diploma",
    shortPitch: "Early childhood education diploma for preschool teaching careers.",
    imageUrl: img("1503454537194-1dd5c0c0c0c0"),
  }),
  baseProgramme({
    id: "prog-law-entrance",
    title: "Law College Entrance Exam Training",
    slug: "law-college-entrance-exam-training",
    level: "Training",
    duration: "Flexible intake",
    shortPitch: "Focused preparation programme for law college entrance examinations.",
    featured: true,
    imageUrl: img("1450101499168-0f0c0c0c0c0c"),
    careerOpportunities: ["Law college entrance readiness", "Legal foundation studies"],
  }),
];

export const careersSeed = [
  {
    id: "career-counsellor",
    title: "Student Counsellor",
    slug: "student-counsellor",
    department: "Admissions & Student Services",
    location: "Island-wide branches",
    type: "Full-time / Part-time",
    description:
      "Guide prospective and enrolled students through programme selection, hybrid learning onboarding and academic planning.",
    requirements: [
      "Excellent communication in English and/or Tamil",
      "Customer-focused mindset with counselling experience preferred",
      "Ability to work across online and direct student engagement",
    ],
    status: "published" as const,
    postedAt: "2026-08-01",
  },
  {
    id: "career-field-officer",
    title: "Field Officer",
    slug: "field-officer",
    department: "Outreach & Operations",
    location: "Multiple branch locations",
    type: "Full-time",
    description:
      "Represent Nextway College International in the field, support branch operations, community outreach and student recruitment activities.",
    requirements: [
      "Valid driving licence and willingness to travel",
      "Strong interpersonal and organisational skills",
      "Experience in education outreach is an advantage",
    ],
    status: "published" as const,
    postedAt: "2026-08-01",
  },
];
