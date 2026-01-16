import { TrendingUp, Users, Calendar } from "lucide-react";

const proofPoints = [
  {
    icon: TrendingUp,
    stat: "700K",
    label: "Followers grown from 60K",
    context: "Helen Leland's strategic partnership journey",
  },
  {
    icon: Calendar,
    stat: "36+",
    label: "Months of partnerships",
    context: "Cured Nutrition at $6K/month",
  },
  {
    icon: Users,
    stat: "100%",
    label: "Word-of-mouth growth",
    context: "Since our founding in 2023",
  },
];

const ProofSection = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4">
            Our <span className="italic text-accent">Impact</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real results that speak for themselves.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {proofPoints.map((point, index) => (
            <div
              key={index}
              className="text-center p-8 bg-background rounded-2xl shadow-sm"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                <point.icon className="w-6 h-6 text-accent" />
              </div>
              <div className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2">
                {point.stat}
              </div>
              <div className="font-medium text-foreground mb-2">
                {point.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {point.context}
              </div>
            </div>
          ))}
        </div>

        {/* Campaign quote */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <blockquote className="font-serif text-xl md:text-2xl italic text-primary">
            "Brand X saw 340% increase in conversions and 2.8x ROAS in first 90 days"
          </blockquote>
          <p className="text-muted-foreground mt-4 text-sm">
            Campaign-specific performance results
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProofSection;
