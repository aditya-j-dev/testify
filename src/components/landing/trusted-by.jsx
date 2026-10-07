"use client";

const colleges = [
  "JNTU Hyderabad",
  "Amity University",
  "SRM Institute",
  "Vellore Institute",
  "Manipal Academy",
  "Saveetha University",
  "Christ University",
  "Lovely Professional",
  "KL University",
  "BITS Pilani",
];

export function TrustedBy() {
  return (
    <section className="py-12 border-b border-testify-border bg-testify-bg relative z-10 w-full overflow-hidden">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 28s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <p className="text-xs uppercase tracking-[0.2em] text-testify-muted2 font-semibold mb-8 text-center">
        Trusted by leading institutions
      </p>

      {/* Fade masks */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
             style={{ background: "linear-gradient(to right, var(--testify-bg), transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
             style={{ background: "linear-gradient(to left, var(--testify-bg), transparent)" }} />

        {/* Sliding track — duplicate list for seamless loop */}
        <div className="flex marquee-track w-max">
          {[...colleges, ...colleges].map((college, i) => (
            <div key={i} className="flex items-center gap-6 mx-8">
              <span className="text-lg md:text-xl font-serif text-testify-text font-medium whitespace-nowrap opacity-50 hover:opacity-90 transition-opacity cursor-default">
                {college}
              </span>
              <span className="text-testify-border2 text-xl select-none">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

