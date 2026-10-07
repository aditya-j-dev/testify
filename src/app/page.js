import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustedBy } from "@/components/landing/trusted-by";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsBar } from "@/components/landing/stats-bar";
import { Pricing } from "@/components/landing/pricing";
import { CtaSection } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-testify-bg text-testify-text selection:bg-testify-accent selection:text-white font-sans overflow-x-hidden">
      <Navbar />
      
      {/* Floating Theme Toggle (optional positioning based on preference, let's keep it visible in bottom-right corner) */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <main className="flex-1 w-full">
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <StatsBar />
        <Pricing />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}