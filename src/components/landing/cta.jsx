import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-32 bg-testify-bg relative z-10 w-full overflow-hidden flex flex-col items-center border-b border-testify-border">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-testify-accent opacity-[0.15] blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 reveal">
        <h2 className="text-5xl md:text-6xl font-serif text-testify-text mb-6 tracking-tight">
          Ready to digitise your exam process?
        </h2>
        <p className="text-xl text-testify-muted mb-10 max-w-2xl mx-auto">
          Join 200+ colleges already running on Testify to conduct secure, scalable, and instant exams.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/get-started">
            <Button size="lg" className="w-full sm:w-auto bg-testify-text hover:bg-white text-testify-bg h-14 px-8 rounded-full text-base font-semibold">
              Create an account
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full text-base border-testify-border text-testify-text hover:bg-testify-surface hover:text-testify-text backdrop-blur-sm">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}
