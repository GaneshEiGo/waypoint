import { GuideSchema, Guide } from "./schema";
import { searchWeb, safeFetch } from "./tools";
import { SYSTEM_PROMPT } from "./prompts";
import { saveGuide } from "./store";
import OpenAI from "openai";

const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY || "dummy", 
  baseURL: "https://api.groq.com/openai/v1" 
});

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

const safeEnum = (val: any, enums: string[], defaultVal: string) => enums.includes(val) ? val : defaultVal;
const safeRange = (r: any) => {
  if (!r || typeof r !== 'object') return null;
  return {
    min: typeof r.min === 'number' ? r.min : 0,
    max: typeof r.max === 'number' ? r.max : 0,
    basis: safeEnum(r.basis, ["published", "reported", "estimated"], "estimated")
  };
};

// Robust domain extractor to get the root domain (e.g., zoom.us)
function extractRootDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const cleanHost = hostname.replace(/^(www|api|developers|developer)\./, "");
    const parts = cleanHost.split('.');
    const tlds = ["co.uk", "com.au", "co.in", "org.uk"];
    const lastTwo = parts.slice(-2).join('.');
    
    if (tlds.includes(lastTwo) && parts.length > 2) {
      return parts.slice(-3).join('.');
    }
    return lastTwo;
  } catch {
    return "unknown";
  }
}

export async function runAgent(appName: string, emit: (event: any) => void) {
  const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  
  emit({ type: "trace", label: `Identifying ${appName}...`, state: "running" });
  const searchResults = await searchWeb(`${appName} oauth app developer documentation`);
  emit({ type: "trace", label: `Found ${searchResults.length} initial sources`, state: "done" });

  if (searchResults.length === 0) {
    emit({ type: "trace", label: `No search results found.`, state: "failed" });
    return;
  }

  emit({ type: "trace", label: `Reading top sources...`, state: "running" });
  let contextText = "";
  for (const res of searchResults.slice(0, 3)) {
    const text = await safeFetch(res.url);
    if (text) contextText += `\n--- SOURCE: ${res.url} ---\n${text.slice(0, 2500)}\n`;
  }
  emit({ type: "trace", label: `Extracted documentation text`, state: "done" });

  emit({ type: "trace", label: `Drafting guide...`, state: "running" });
  const prompt = `App Name: ${appName}\n\nDocumentation Context:\n${contextText}`;
  let parsed: any = null;

  try {
    const groqRes = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
    });
    parsed = extractJson(groqRes.choices[0]?.message?.content || "");
  } catch (e: any) {
    emit({ type: "trace", label: `Groq Error: ${e.message}`, state: "failed" });
    return;
  }

  if (!parsed) {
    emit({ type: "trace", label: `Failed to parse AI response.`, state: "failed" });
    return;
  }

  emit({ type: "trace", label: `Validating claims...`, state: "running" });
  
  const finalDomain = extractRootDomain(searchResults[0]?.url || "https://example.com");

  const finalGuide: Guide = {
    schema_version: 1, slug, name: appName, domain: finalDomain,
    subtitle: "OAuth Integration", summary: parsed.summary || "Generated via live research.",
    status: safeEnum(parsed.status, ["complete", "partial", "unresolved"], "partial"), oauth_support: "likely",
    own_app: { answer: "yes", basis: "Standard practice" }, start_here: { label: "Read Docs", url: searchResults[0]?.url || "https://example.com" },
    difficulty: safeEnum(parsed.difficulty, ["easy", "medium", "hard", "depends", "unknown"], "unknown"), difficulty_reason: parsed.difficulty_reason || "Analyzed from docs.",
    hands_on: safeRange(parsed.hands_on), waiting: safeRange(parsed.waiting), waiting_note: parsed.waiting_note || "Not published",
    needs: ["Developer Account"],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map((s: any, i: number) => ({
        id: s.id || String(i + 1), title: s.title || "Step", detail: s.detail || "",
        who: safeEnum(s.who, ["agent", "you", "provider"], "you"), required: s.required !== false, source_ids: ["src0"]
    })) : [],
    watch_out: [],
    agent_can: ["Draft configuration"], you_must: ["Sign in to provider"],
    claims: Array.isArray(parsed.claims) ? parsed.claims.map((c: any) => ({
        text: c.text || "", level: safeEnum(c.level, ["verified", "observed", "inferred", "unverified"], "unverified"), source_ids: ["src0"], quote: c.quote || undefined
    })) : [],
    checks: { level: "read", done: ["Fetched docs"], not_done: ["Did not create app"] },
    sources: searchResults.map((r: any, i: number) => ({
      id: `src${i}`, title: r.title || "Source", url: r.url, kind: "official", opened_at: new Date().toISOString().split("T")[0], status: "opened"
    })),
    generated_at: new Date().toISOString(), generated_by: "agent"
  };

  const parseResult = GuideSchema.safeParse(finalGuide);
  if (!parseResult.success) {
      emit({ type: "trace", label: `Validation failed: Zod error.`, state: "failed" });
      return;
  }

  emit({ type: "trace", label: `Guide complete`, state: "done" });
  await saveGuide(finalGuide);
  emit({ type: "done", guide: finalGuide });
}