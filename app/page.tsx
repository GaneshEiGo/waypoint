import { Suspense } from "react";
import { connection } from "next/server";
import { getAllGuides } from "@/lib/store";
import { seededGuides } from "@/lib/seeded";
import IndexList from "@/components/IndexList";

async function HomeContent() {
  await connection(); // Bypasses Next.js cache
  
  const savedGuides = await getAllGuides();
  const allGuides = { ...seededGuides };
  savedGuides.forEach(g => {
    allGuides[g.slug] = g;
  });
  
  const guides = Object.values(allGuides);

  return (
    <main className="container-index">
      <h1>Know what you're walking into.</h1>
      <p className="subtitle">
        Setup guides for the OAuth apps you need to connect. What it takes, how long it waits, what to watch for.
      </p>
      <IndexList guides={guides} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)', padding: '120px 24px', textAlign: 'center' }}>
        Loading directory...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}