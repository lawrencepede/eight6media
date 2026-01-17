import { Target, Users, Sparkles } from "lucide-react";

const differentiators = [
  {
    icon: Target,
    title: "Performance-Focused Results",
    description:
      "We structure partnerships to deliver measurable impact aligned with your specific marketing objectives—from brand awareness to direct sales conversions.",
    highlight: "From brand awareness to direct sales",
  },
  {
    icon: Users,
    title: "Selective Network of Creators",
    description:
      "We represent carefully vetted creators who align with our authenticity standards and have cultivated extremely loyal, engaged followings.",
    highlight: "Carefully vetted for authenticity",
  },
  {
    icon: Sparkles,
    title: "Full-Service Partnerships",
    description:
      "Beyond matchmaking, we provide content strategy, psychological selling techniques, scripting, audience building, and end-to-end partnership execution oversight.",
    highlight: "End-to-end partnership support",
  },
];

const DifferentiatorsSection = () => {
  return (
    <section className="section-padding bg-soft-tan">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4">
            Beyond the <span className="italic text-accent">Vanity Metrics</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            After managing creator marketing in-house and recognizing what was missing, we built an agency around three core differentiators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {differentiators.map((item, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <item.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {item.description}
              </p>
              <span className="text-sm font-medium text-accent">
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
