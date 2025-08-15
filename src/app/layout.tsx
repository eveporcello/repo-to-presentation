/**
 * @file layout.tsx
 * @description
 * Root layout component for the Repo Presenter Next.js application.
 * Defines global metadata, imports global styles, and applies base
 * typography and layout styling across all pages.
 *
 * @remarks
 * - Uses Next.js `Metadata` for SEO, social previews, and crawler directives.
 * - Loads the Inter font from Google Fonts with `display: swap` and a CSS variable for Tailwind integration.
 * - Wraps all pages in a consistent HTML structure with `lang="en"`, full-height body, and
 *   a gray background.
 * - Applies `font-sans` and antialiased text for improved readability.
 * - Metadata includes Open Graph and Twitter Card settings for link previews.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Repo Presenter",
  description:
    "Turn your GitHub repo into your best presentation.",
  keywords: [
    "github",
    "presentation",
    "developer tools",
    "AI",
    "Claude",
  ],
  authors: [
    {
      name: "Eve Porcello",
      url: "https://moonhighway.com",
    },
  ],
  creator: "Eve Porcello",
  openGraph: {
    title: "Repo Presenter",
    description:
      "Turn your GitHub repo into your best presentation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repo Presenter",
    description:
      "Turn your GitHub repo into your best presentation.",
    creator: "@eveporcello",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    "https://repo-presenter.vercel.app"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full bg-gray-50 antialiased font-sans">
        <div className="min-h-full">{children}</div>
      </body>
    </html>
  );
}
