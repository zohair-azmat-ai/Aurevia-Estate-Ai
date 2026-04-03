import type { Metadata } from "next";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TrustBar from "../components/landing/TrustBar";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import ArchitecturePreview from "../components/landing/ArchitecturePreview";
import Showcase from "../components/landing/Showcase";
import Integrations from "../components/landing/Integrations";
import CTASection from "../components/landing/CTASection";
import Footer from "../components/landing/Footer";

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
    <div className="landing-luxury-bg min-h-screen text-content-primary">
      <Navbar />
      <main className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(201,168,76,0.14),transparent_42%)]" />
        <Hero />
        <div className="landing-section-wash">
          <TrustBar />
          <Features />
          <HowItWorks />
          <ArchitecturePreview />
          <Showcase />
          <Integrations />
          <CTASection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
