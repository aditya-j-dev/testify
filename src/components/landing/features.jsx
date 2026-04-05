export function Features() {
  const features = [
    { icon: "🧠", title: "Smart Question Builder", desc: "Create rich question banks with LaTeX, code blocks, and media support." },
    { icon: "🛡️", title: "Proctored Live Exams", desc: "AI-driven anti-cheat monitoring mapping eye, tab and screen behaviors.", badge: "Anti-cheat" },
    { icon: "⚡", title: "Instant Auto-grading", desc: "Save hundreds of hours with automated evaluation for objective & short answers." },
    { icon: "📊", title: "Rich Analytics", desc: "Identify class trends, weakest subject areas, and generate granular reports." },
    { icon: "🎓", title: "Student Portal", desc: "A unified neat dashboard for students to view schedules, tests, and their performance." },
    { icon: "🔐", title: "Roles & Permissions", desc: "Granular access control for admins, faculty, and examination controllers." },
  ];

  return (
    <section id="features" className="py-24 bg-testify-bg relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-testify-accent text-sm font-bold uppercase tracking-widest mb-4">Platform</p>
          <h2 className="text-4xl md:text-5xl font-serif text-testify-text reveal">
            Everything your exam office needs
          </h2>
        </div>

        {/* 2px Gap Border Trick Container */}
        <div className="bg-testify-border p-[1px] rounded-xl overflow-hidden reveal [animation-delay:200ms]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]">
            {features.map((f, i) => (
              <div key={i} className="bg-testify-surface hover:bg-testify-surface2 transition-colors duration-300 p-8 flex flex-col items-start gap-4 h-full relative group">
                <div className="w-12 h-12 flex items-center justify-center bg-testify-bg rounded-lg border border-testify-border text-2xl group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                
                {f.badge && (
                  <span className="absolute top-8 right-8 text-[10px] uppercase font-bold tracking-wider text-testify-accent bg-[rgba(79,110,247,0.1)] px-2 py-1 rounded border border-[rgba(79,110,247,0.2)]">
                    {f.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-testify-text mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-testify-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
