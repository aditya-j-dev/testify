export function StatsBar() {
  const stats = [
    { num: "50", suffix: "K+", label: "Exams Conducted" },
    { num: "2", suffix: "M+", label: "Submissions" },
    { num: "99.9", suffix: "%", label: "Uptime" },
    { num: "4", suffix: "s", label: "Result Time" },
  ];

  return (
    <section className="py-12 bg-testify-bg relative z-10 w-full px-6">
      <div className="max-w-7xl mx-auto bg-testify-border p-[1px] rounded-xl overflow-hidden reveal">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px]">
          {stats.map((stat, i) => (
            <div key={i} className="bg-testify-surface py-12 px-6 flex flex-col items-center justify-center text-center">
              <div className="text-4xl md:text-5xl font-serif text-testify-text tracking-tight mb-2">
                {stat.num}<span className="text-testify-accent italic">{stat.suffix}</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-testify-muted2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
