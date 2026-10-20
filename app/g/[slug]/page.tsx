import { Suspense } from "react";
import { getGuide } from "@/lib/store";
import { seededGuides } from "@/lib/seeded";
import GuideView from "@/components/Guide";
import LiveResearch from "@/components/Trace";
import Link from "next/link";

// We move the data fetching into this child component
async function GuideContent({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  
  let guide = seededGuides[slug];
  if (!guide) {
    guide = await getGuide(slug) as any;
  }

  return guide ? (
    <GuideView guide={guide} />
  ) : (
    <LiveResearch appName={slug} />
  );
}

export default function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <main className="container-guide">
      <div className="guide-meta-top">
        <Link href="/" style={{ border: 'none' }}>← Atlas</Link>
      </div>
      
      <Suspense fallback={
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)', marginTop: '40px' }}>
          Loading guide...
        </div>
      }>
        <GuideContent paramsPromise={params} />
      </Suspense>
    </main>
  );
}