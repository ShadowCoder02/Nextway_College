import { promises as fs } from "fs";
import path from "path";
import type { CareerVacancy, EventItem, NewsArticle, Programme } from "@/types";
import { events as seedEvents, newsArticles as seedNews } from "@/data/content";
import { careersSeed, programmesSeed } from "@/data/programmes-seed";

const CMS_DIR = path.join(process.cwd(), "data", "cms");
const CMS_VERSION = "3";

export type StoredEnquiry = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  programme_id?: string | null;
  programme_title?: string | null;
  qualification?: string | null;
  intake?: string | null;
  message?: string | null;
  source?: string;
  status: "new" | "contacted" | "follow_up" | "converted" | "closed";
  consent: boolean;
  created_at: string;
};

async function ensureDir() {
  await fs.mkdir(CMS_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureDir();
  const filePath = path.join(CMS_DIR, file);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    if (!raw.trim()) {
      await writeJson(file, fallback);
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      await writeJson(file, fallback);
      return fallback;
    }
  } catch {
    await writeJson(file, fallback);
    return fallback;
  }
}

async function writeJson<T>(file: string, data: T) {
  await ensureDir();
  await fs.writeFile(path.join(CMS_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

export async function getStoredProgrammes(): Promise<Programme[]> {
  const version = await readJson<{ version: string }>("version.json", { version: "0" });
  if (version.version !== CMS_VERSION) {
    await writeJson("programmes.json", programmesSeed);
    await writeJson("version.json", { version: CMS_VERSION });
    return programmesSeed;
  }
  return readJson<Programme[]>("programmes.json", programmesSeed);
}

export async function saveProgrammes(programmes: Programme[]) {
  await writeJson("programmes.json", programmes);
}

export async function getStoredEvents(): Promise<EventItem[]> {
  return readJson<EventItem[]>("events.json", seedEvents);
}

export async function saveEvents(events: EventItem[]) {
  await writeJson("events.json", events);
}

export async function getStoredEnquiries(): Promise<StoredEnquiry[]> {
  return readJson<StoredEnquiry[]>("enquiries.json", []);
}

export async function addStoredEnquiry(
  enquiry: Omit<StoredEnquiry, "id" | "created_at" | "status">,
) {
  const list = await getStoredEnquiries();
  const row: StoredEnquiry = {
    ...enquiry,
    id: crypto.randomUUID(),
    status: "new",
    created_at: new Date().toISOString(),
  };
  list.unshift(row);
  await writeJson("enquiries.json", list);
  return row;
}

export async function updateStoredEnquiry(id: string, patch: Partial<StoredEnquiry>) {
  const list = await getStoredEnquiries();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  await writeJson("enquiries.json", list);
  return list[idx];
}

export async function getStoredNews(): Promise<NewsArticle[]> {
  return readJson<NewsArticle[]>("news.json", seedNews);
}

export async function saveNews(news: NewsArticle[]) {
  await writeJson("news.json", news);
}

export async function getStoredCareers(): Promise<CareerVacancy[]> {
  return readJson<CareerVacancy[]>("careers.json", careersSeed);
}

export async function saveCareers(careers: CareerVacancy[]) {
  await writeJson("careers.json", careers);
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
