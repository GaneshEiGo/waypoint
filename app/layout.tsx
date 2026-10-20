import type { Metadata } from "next";
import { Playfair_Display, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const serif = Playfair_Display({ 
  weight: ["400", "500", "600"], 
  subsets: ["latin"], 
  variable: "--font-serif",
  display: "swap" 
});
const sans = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap" 
});
const mono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Waypoint | OAuth Setup Guides",
  description: "Know what you're walking into.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}