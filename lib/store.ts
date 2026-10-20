import { Redis } from "@upstash/redis";
import { Guide } from "./schema";

let redis: Redis | null = null;
const memoryStore = new Map<string, Guide>();
const aliases = new Map<string, string>();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function saveGuide(guide: Guide) {
  if (redis) {
    await redis.set(`guide:${guide.slug}`, JSON.stringify(guide), { ex: 60 * 60 * 24 * 30 });
    await redis.set(`alias:${guide.name.toLowerCase()}`, guide.slug);
  } else {
    memoryStore.set(guide.slug, guide);
    aliases.set(guide.name.toLowerCase(), guide.slug);
  }
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const cleanSlug = slug.toLowerCase().trim();
  if (redis) {
    const realSlug = await redis.get(`alias:${cleanSlug}`);
    const data = await redis.get(realSlug ? `guide:${realSlug}` : `guide:${cleanSlug}`);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  } else {
    const realSlug = aliases.get(cleanSlug);
    return memoryStore.get(realSlug || cleanSlug) || null;
  }
}

export async function getAllGuides(): Promise<Guide[]> {
  if (redis) {
    try {
      const keys = await redis.keys('guide:*');
      if (!keys || keys.length === 0) return [];
      const pipeline = redis.pipeline();
      keys.forEach(k => pipeline.get(k));
      const results = await pipeline.exec() as unknown[]; // FIX: Cast to unknown array
      
      return results.map(r => typeof r === 'string' ? JSON.parse(r) : r).filter(Boolean) as Guide[];
    } catch (e) {
      return [];
    }
  } else {
    return Array.from(memoryStore.values());
  }
}

export async function acquireLock(slug: string): Promise<boolean> {
  if (redis) return (await redis.set(`lock:${slug}`, "locked", { nx: true, ex: 60 })) === "OK";
  return true;
}

export async function releaseLock(slug: string) {
  if (redis) await redis.del(`lock:${slug}`);
}
