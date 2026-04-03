import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ChatWidget } from "../components/chat/chat-widget";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurevia-estate-ai.vercel.app"),
  title: {
    default: "Aurevia Estate AI",
    template: "%s | Aurevia Estate AI",
  },
  description:
    "AI-powered real estate lead automation. Capture, qualify, and convert leads across every channel automatically.",
  keywords: [
    "real estate AI",
    "lead automation",
    "proptech",
    "AI CRM",
    "WhatsApp real estate",
    "lead qualification",
  ],
  authors: [{ name: "Aurevia Estate AI" }],
  creator: "Aurevia Estate AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aurevia-estate-ai.vercel.app/",
    title: "Aurevia Estate AI",
    description: "Intelligent Conversations. Qualified Leads. Closed Deals.",
    siteName: "Aurevia Estate AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurevia Estate AI",
    description: "Intelligent Conversations. Qualified Leads. Closed Deals.",
  },
  alternates: {
    canonical: "https://aurevia-estate-ai.vercel.app/",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
