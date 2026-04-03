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
    <div className="landing-luxury-bg relative min-h-screen text-content-primary">

      {/* ── Cinematic atmospheric layers ── */}

      {/* Fixed top-center gold corona */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[480px]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 110% 100% at 50% -5%, rgba(214,174,83,0.20) 0%, rgba(201,168,76,0.07) 40%, transparent 68%)",
        }}
      />

      {/* Top edge highlight beam */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[1px] opacity-50"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, rgba(201,168,76,0.35) 30%, rgba(255,255,255,0.22) 50%, rgba(201,168,76,0.35) 70%, transparent 95%)",
        }}
      />

      {/* Side accent glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 92% 10%, rgba(56,88,154,0.16), transparent 20%), radial-gradient(circle at 8% 86%, rgba(201,168,76,0.08), transparent 24%)",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 50%, rgba(3,4,8,0.48) 100%)",
        }}
      />

      <Navbar />

      <main className="relative z-10">
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
