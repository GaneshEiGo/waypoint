"use client";

import Link from "next/link";
import { Guide } from "@/lib/schema";
import Search from "./Search";

function AppIcon({ domain, name }: { domain: string; name: string }) {
  return (
    <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
      <img
        src={`https://logo.debounce.com/${domain}`}
        alt={name}
        className="app-icon"
        onError={(e) => {
          // If the image fails to load entirely, hide it and show the text fallback
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
        suppressHydrationWarning
      />
      <div className="app-fallback-icon" style={{ display: 'none' }}>
        {name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
}

export default function IndexList({ guides }: { guides: Guide[] }) {
  // Ensure unique guides by slug to prevent React key errors
  const uniqueGuides = Array.from(new Map(guides.map(g => [g.slug, g])).values());

  return (
    <div className="index-list">
      {uniqueGuides.map((guide) => (
        <Link href={`/g/${guide.slug}`} key={guide.slug} className="index-row">
          <div className="app-cell">
            <AppIcon domain={guide.domain} name={guide.name} />
            <span className="app-name">{guide.name}</span>
          </div>
          <span className="meta">{guide.difficulty}</span>
          <span className="meta">{guide.hands_on ? `${guide.hands_on.min}-${guide.hands_on.max} min` : "Unknown"}</span>
          <span className="meta">{guide.waiting ? `${guide.waiting.min}-${guide.waiting.max} days` : "No wait"}</span>
        </Link>
      ))}
      <Search />
    </div>
  );
}   