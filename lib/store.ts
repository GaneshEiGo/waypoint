import { Redis } from "@upstash/redis";
import { Guide } from "./schema";
import fs from "fs";
import path from "path";

let redis: Redis | null = null;
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'guides.json');

// Ensure the .data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

function getLocalGuides(): Record<string, Guide> {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveLocalGuide(guide: Guide) {
  const guides = getLocalGuides();
  guides[guide.slug] = guide;
  fs.writeFileSync(DATA_FILE, JSON.stringify(guides, null, 2));
}

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function saveGuide(guide: Guide) {
  if (redis) {
    await redis.set(`guide:${guide.slug}`, JSON.stringify(guide), { ex: 60 * 60 * 24 * 30 });
    await redis.set(`alias:${guide.name.toLowerCase()}`, guide.slug);
  } else {
    saveLocalGuide(guide);
  }
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const cleanSlug = slug.toLowerCase().trim();
  if (redis) {
    const realSlug = await redis.get(`alias:${cleanSlug}`);
    const data = await redis.get(realSlug ? `guide:${realSlug}` : `guide:${cleanSlug}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  } else {
    const guides = getLocalGuides();
    const found = Object.values(guides).find(g => g.slug === cleanSlug || g.name.toLowerCase() === cleanSlug);
    return found || null;
  }
}

export async function getAllGuides(): Promise<Guide[]> {
  if (redis) {
    try {
      const keys = await redis.keys('guide:*');
      if (!keys || keys.length === 0) return [];
      const pipeline = redis.pipeline();
      keys.forEach(k => pipeline.get(k));
      const results = await pipeline.exec();
      return results.map(r => typeof r === 'string' ? JSON.parse(r) : r).filter(Boolean) as Guide[];
    } catch (e) {
      return [];
    }
  } else {
    return Object.values(getLocalGuides());
  }
}

export async function acquireLock(slug: string): Promise<boolean> {
  if (redis) return (await redis.set(`lock:${slug}`, "locked", { nx: true, ex: 60 })) === "OK";
  return true;
}

export async function releaseLock(slug: string) {
  if (redis) await redis.del(`lock:${slug}`);
}