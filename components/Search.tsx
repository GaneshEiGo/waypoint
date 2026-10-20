"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/g/${encodeURIComponent(query.trim().toLowerCase())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="new-app-row">
      <span style={{ marginRight: '16px', color: 'var(--muted)' }}>+</span>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type an app we haven't written yet... (Press / to focus)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        suppressHydrationWarning={true} 
      />
    </form>
  );
}