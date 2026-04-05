import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "₹4,999",
      period: "/month",
      desc: "Perfect for small departments and independent coaching centers.",
      features: ["Up to 500 active students", "Basic question bank", "Standard reporting", "Email support", "1 admin account"],
      buttonText: "Start Free Trial",
      buttonVariant: "outline",
      featured: false
    },
    {
      name: "College",
      price: "₹12,999",
      period: "/month",
      desc: "Everything a growing institution needs for secure examinations.",
      features: ["Up to 5,000 active students", "AI Proctoring & Anti-cheat", "Advanced analytics", "LMS Integrations", "Priority support", "Unlimited faculty accounts"],
      buttonText: "Get Started",
      buttonVariant: "default",
      featured: true,
      badge: "Most Popular"
    },
    {
      name: "University",
      price: "Custom",
      period: "",
      desc: "Dedicated infrastructure and customized features for large universities.",
      features: ["Unlimited students", "Custom domains & SSO", "Dedicated success manager", "SLA guarantee", "On-premise deployment option", "Custom ERP integration"],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-testify-bg2 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-testify-accent text-sm font-bold uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-serif text-testify-text mb-4">
            Simple pricing for institutions of all sizes
          </h2>
          <p className="text-testify-muted text-lg max-w-2xl mx-auto">No hidden fees. Switch plans or cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`reveal [animation-delay:calc(var(--delay)*100ms)] relative bg-testify-surface rounded-2xl p-8 flex flex-col h-full border transition-all duration-300 hover:-translate-y-2
                ${tier.featured ? 'border-testify-accent md:scale-105 shadow-[0_20px_50px_rgba(79,110,247,0.15)] z-10' : 'border-testify-border'}
              `}
              style={{ "--delay": i }}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-testify-accent text-white text-[10px] uppercase font-bold tracking-wider py-1 px-3 rounded-full">
                  {tier.badge}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-testify-text mb-2 tracking-tight">{tier.name}</h3>
                <p className="text-testify-muted text-sm leading-relaxed h-10">{tier.desc}</p>
              </div>

              <div className="mb-8 flex items-end">
                <span className="text-5xl font-serif text-testify-text block">{tier.price}</span>
                {tier.period && <span className="text-testify-muted ml-1 pb-1">{tier.period}</span>}
              </div>

              <Button 
                variant={tier.buttonVariant} 
                className={`w-full mb-8 h-12 rounded-lg 
                  ${tier.featured ? 'bg-testify-accent hover:bg-testify-accent2 text-white border-0' : 'border-testify-border text-testify-text hover:bg-testify-bg3'}
                `}
              >
                {tier.buttonText}
              </Button>

              <div className="flex-1">
                <p className="text-xs uppercase font-bold tracking-wider text-testify-muted2 mb-4">What's included</p>
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-testify-text">
                      <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-[rgba(79,110,247,0.1)] flex items-center justify-center text-testify-accent">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
