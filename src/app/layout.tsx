import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mantra Tracker - Mindful Practice Companion",
  description: "Cultivate mindfulness and track your spiritual journey with intention and grace. Beautifully designed mantra tracking for modern practitioners.",
  keywords: ["mantra", "meditation", "mindfulness", "spiritual practice", "journey tracking"],
  authors: [{ name: "Mantra Tracker Team" }],
  creator: "Mantra Tracker",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mantra-tracker.vercel.app",
    title: "Mantra Tracker - Mindful Practice Companion",
    description: "Cultivate mindfulness and track your spiritual journey with intention and grace",
    siteName: "Mantra Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mantra Tracker - Mindful Practice Companion",
    description: "Cultivate mindfulness and track your spiritual journey with intention and grace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
