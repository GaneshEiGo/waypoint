import { runAgent } from "@/lib/agent";
import { acquireLock, releaseLock } from "@/lib/store";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { appName } = await req.json();
  const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  
  const locked = await acquireLock(slug);
  if (!locked) return new Response("Research already in progress.", { status: 429 });

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: any) => controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      try {
        await runAgent(appName, emit);
      } catch (e) {
        emit({ type: "error", message: "Agent failed" });
      } finally {
        await releaseLock(slug);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
  });
}