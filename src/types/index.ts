export type ProgrammeLevel = "Degree" | "Higher Diploma" | "Diploma" | "Certificate" | "Training";
export type StudyMode = "Hybrid" | "Online" | "Direct" | "Flexible" | "Full-time" | "Part-time";
export type PublishStatus = "draft" | "published" | "archived";
export type EnquiryStatus = "new" | "contacted" | "follow_up" | "converted" | "closed";

export type SchoolSlug =
  | "computing-it"
  | "business-management"
  | "language-communication"
  | "hospitality-tourism"
  | "law"
  | "education"
  | "social-sciences";

export interface School {
  id: string;
  name: string;
  slug: SchoolSlug;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProgrammeModule {
  id: string;
  yearOrStage: string;
  code: string;
  title: string;
  credits?: number;
  description?: string;
  sortOrder: number;
}

export interface ProgrammeFee {
  intake: string;
  registrationFee?: string;
  courseFee?: string;
  instalmentNote?: string;
  currency: string;
  isCurrent: boolean;
}

export interface ProgrammePartner {
  partnerName: string;
  partnerType: string;
  logoUrl?: string;
  description?: string;
  verified: boolean;
}

export interface Programme {
  id: string;
  schoolId: string;
  schoolSlug: SchoolSlug;
  schoolName: string;
  title: string;
  slug: string;
  level: ProgrammeLevel;
  duration: string;
  credits?: string;
  mode: StudyMode;
  medium: string;
  intake: string;
  location: string;
  overview: string;
  whyThisProgramme: string;
  learningOutcomes: string[];
  entryRequirements: string[];
  assessment: string;
  careerOpportunities: string[];
  progression: string;
  faqs: { question: string; answer: string }[];
  imageUrl: string;
  featured: boolean;
  flagship?: boolean;
  status: PublishStatus;
  seoTitle?: string;
  seoDescription?: string;
  modules: ProgrammeModule[];
  fees?: ProgrammeFee;
  partners?: ProgrammePartner[];
  shortPitch: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  publishedAt: string;
  category: string;
  status: PublishStatus;
  seoTitle?: string;
  seoDescription?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  startAt: string;
  endAt?: string;
  location: string;
  imageUrl: string;
  registrationUrl?: string;
  status: PublishStatus;
}

export interface Testimonial {
  id: string;
  studentName: string;
  programme: string;
  quote: string;
  imageUrl?: string;
  status: PublishStatus;
  consentConfirmed: boolean;
}

export interface EnquiryInput {
  fullName: string;
  phone: string;
  email: string;
  programmeId?: string;
  programmeTitle?: string;
  qualification?: string;
  intake?: string;
  message?: string;
  source?: string;
  consent: boolean;
}

export interface SiteStat {
  label: string;
  value: string;
}

export interface CareerVacancy {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  status: PublishStatus;
  postedAt: string;
}
