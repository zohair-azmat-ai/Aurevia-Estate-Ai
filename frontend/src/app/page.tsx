import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import ArchitecturePreview from "@/components/landing/ArchitecturePreview";
import Showcase from "@/components/landing/Showcase";
import Integrations from "@/components/landing/Integrations";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Aurevia Estate AI — Intelligent Real Estate Automation",
  description:
    "AI-powered real estate lead automation. Capture, qualify, and convert leads from WhatsApp, email, and your website — automatically. Built with GPT-4o, Qdrant, FastAPI, and Next.js.",
  openGraph: {
    title: "Aurevia Estate AI",
    description: "Intelligent Conversations. Qualified Leads. Closed Deals.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <ArchitecturePreview />
        <Showcase />
        <Integrations />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
