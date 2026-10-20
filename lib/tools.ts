import dns from "dns/promises";
import net from "net";

export async function searchWeb(query: string) {
  if (!process.env.TAVILY_API_KEY) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: 3 }),
  });
  const data = await res.json();
  return data.results || [];
}

export async function safeFetch(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    
    const host = parsed.hostname;
    if (net.isIP(host)) return null;
    
    const addrs = await dns.lookup(host, { all: true });
    for (const addr of addrs) {
      if (addr.address.startsWith("127.") || addr.address.startsWith("10.") || addr.address.startsWith("192.168.") || addr.address.startsWith("169.254.")) {
        return null;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "WaypointBot/1.0" } });
    clearTimeout(timeout);
    
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 1000000);
  } catch {
    return null;
  }
}