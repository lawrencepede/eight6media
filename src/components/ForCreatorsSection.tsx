import { Star, TrendingUp, Heart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

const offerings = [
  {
    icon: DollarSign,
    title: "Premium Partnerships",
    description: "Multi-month contracts averaging $5-40K/month—some of the biggest deals in the space for medium-sized creators",
  },
  {
    icon: TrendingUp,
    title: "Strategic Growth",
    description: "Content strategy and audience building support to maximize your earning potential",
  },
  {
    icon: Heart,
    title: "Brand Alignment",
    description: "Only partnerships that fit your authentic voice and add value to your community",
  },
  {
    icon: Star,
    title: "Proven Results",
    description: "Our creators see significant follower growth and sustainable revenue increases",
  },
];

const ForCreatorsSection = () => {
  return (
    <section id="creators" className="section-padding bg-soft-tan">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4">
              For <span className="italic text-accent">Creators</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-2">
              Join Our Selective Network
            </p>
            <p className="text-sm text-muted-foreground">
              Application Required — We maintain quality through selective standards
            </p>
          </div>

          {/* Offerings Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {offerings.map((offering, index) => (
              <div
                key={index}
                className="bg-background p-6 rounded-2xl text-center group hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <offering.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                  {offering.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {offering.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <blockquote className="font-serif italic text-xl text-primary mb-8">
              "Ready to elevate your creator partnerships?"
            </blockquote>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              onClick={() => window.open("https://calendly.com", "_blank")}
            >
              Apply to Join Eight-Six
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForCreatorsSection;
