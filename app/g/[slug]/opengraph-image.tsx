import { ImageResponse } from "next/og";
import { getGuide } from "@/lib/store";
import { seededGuides } from "@/lib/seeded";

export const alt = "Waypoint guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let guide = seededGuides[slug] as { name?: string; subtitle?: string } | undefined;
  if (!guide) {
    try {
      guide = (await getGuide(slug)) as any;
    } catch {
      guide = undefined;
    }
  }

  const title = guide?.name ?? slug;
  const subtitle = guide?.subtitle ?? "Setup guide";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#FAFAF8",
          color: "#111",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#1F4FD8", letterSpacing: 2 }}>WAYPOINT</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 40, color: "#555", marginTop: 16 }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
