import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

// PRD §10: one clean modern sans, loaded once here and consumed via --font-sans.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Needed to resolve the relative OG image paths on template pages into absolute
  // URLs. Set NEXT_PUBLIC_SITE_URL in the deployment environment.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Telugu Templates — Meme templates from Telugu cinema",
    template: "%s · Telugu Templates",
  },
  description:
    "Search Telugu movie meme templates by dialogue, movie, actor or emotion. Find the scene, download it, make the meme.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar />
        {/*
          The homepage hero sits under the transparent navbar by design, so no top
          padding here — inner pages add their own.
        */}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
