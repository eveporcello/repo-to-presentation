import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pitch My Repo",
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
    title: "Pitch My Repo",
    description:
      "Turn your GitHub repo into your best presentation.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitch My Repo",
    description:
      "Turn your GitHub repo into your best presentation.",
    creator: "@eveporcello",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://pitch-my-repo.vercel.app"),
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
