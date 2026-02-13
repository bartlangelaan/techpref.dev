import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

export const dynamic = "error";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://techpref.dev";

export const metadata: Metadata = {
  title: {
    default: "TechPref - JavaScript & TypeScript Style Preferences",
    template: "%s | TechPref",
  },
  description:
    "Explore the most debated coding style preferences with real-world data from popular open source TypeScript projects. Compare spaces vs tabs, semicolons, and more.",
  keywords: [
    "JavaScript",
    "TypeScript",
    "coding style",
    "code style",
    "style guide",
    "spaces vs tabs",
    "semicolons",
    "ESLint",
    "prettier",
    "code formatting",
  ],
  authors: [{ name: "TechPref" }],
  creator: "TechPref",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TechPref",
    title: "TechPref - JavaScript & TypeScript Style Preferences",
    description:
      "Explore the most debated coding style preferences with real-world data from popular open source TypeScript projects.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechPref - JavaScript & TypeScript Style Preferences",
    description:
      "Explore the most debated coding style preferences with real-world data from popular open source TypeScript projects.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
