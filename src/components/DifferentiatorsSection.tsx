import { Target, Users, Sparkles } from "lucide-react";

const differentiators = [
  {
    icon: Target,
    title: "PERFORMANCE-FOCUSED RESULTS",
    description:
      "We structure partnerships to deliver measurable impact aligned with your specific marketing objectives—from brand awareness to direct sales conversions.",
    highlight: "From brand awareness to direct sales",
  },
  {
    icon: Users,
    title: "SELECTIVE NETWORK OF CREATORS",
    description:
      "We represent carefully vetted creators who align with our authenticity standards and have cultivated extremely loyal, engaged followings.",
    highlight: "Carefully vetted for authenticity",
  },
  {
    icon: Sparkles,
    title: "FULL-SERVICE PARTNERSHIPS",
    description:
      "Beyond matchmaking, we provide content strategy, psychological selling techniques, scripting, audience building, and end-to-end partnership execution oversight.",
    highlight: "End-to-end partnership support",
  },
];

const DifferentiatorsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-4xl md:text-6xl text-primary mb-4">
            BEYOND THE <span className="text-accent">VANITY METRICS</span>
          </h2>
          <p className="font-script text-2xl text-muted-foreground">
            After managing creator marketing in-house and recognizing what was missing, we built an agency around three core differentiators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {differentiators.map((item, index) => (
            <div
              key={index}
              className="bg-background border border-border p-8 hover:border-accent transition-colors group"
            >
              <div className="w-14 h-14 border-2 border-accent flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <item.icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
              </div>
              <h3 className="font-display text-xl text-primary mb-3">
                {item.title}
              </h3>
              <p className="font-script text-xl text-muted-foreground mb-4 leading-relaxed">
                {item.description}
              </p>
              <span className="font-script text-lg text-accent">
                {item.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorsSection;