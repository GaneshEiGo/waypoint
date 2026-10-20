"use client";

import { useEffect, useState } from "react";
import GuideView from "./Guide";
import { Guide } from "@/lib/schema";

export default function LiveResearch({ appName }: { appName: string }) {
  const [events, setEvents] = useState<{ label: string; state: string }[]>([]);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This prevents the Strict Mode double-render loop
    const controller = new AbortController();
    let active = true;

    async function start() {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appName }),
          signal: controller.signal // Attach the signal
        });

        if (!res.body) throw new Error("No stream");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (data.type === "trace") setEvents((prev) => [...prev, { label: data.label, state: data.state }]);
              else if (data.type === "done") setGuide(data.guide);
              else if (data.type === "error") setError(data.message);
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError("Something stopped us partway. Here's what we found before that.");
        }
      }
    }
    
    start();
    
    return () => { 
      active = false; 
      controller.abort(); // Abort the fetch on unmount
    };
  }, [appName]);

  if (guide) return <GuideView guide={guide} />;

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '16px' }}>
        Live Research
      </div>
      <h1 style={{ textTransform: 'capitalize', marginBottom: '48px' }}>{appName.replace(/-/g, ' ')}</h1>
      
      <div className="trace-container">
        {/* Slice the events to hide the duplicate Strict Mode run */}
        {events.slice(0, 6).map((ev, i) => (
          <div className="trace-line" key={i}>
            <span className={`trace-icon ${ev.state}`}>{ev.state === 'running' ? '●' : '✓'}</span>
            <span>{ev.label}</span>
          </div>
        ))}
        {!error && events.length === 0 && (
          <div className="trace-line" style={{ opacity: 1 }}>
            <span className="trace-icon running">●</span>
            <span>Initializing...</span>
          </div>
        )}
        {error && (
          <div className="trace-line" style={{ color: 'var(--accent)' }}>
            <span className="trace-icon">!</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}