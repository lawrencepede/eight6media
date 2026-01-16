import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-soft-tan via-background to-secondary">
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Authentic Creators.
            <br />
            <span className="italic text-accent">Impact focus.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            We're a selective creator agency representing trusted creators who deliver measurable results for brands—from emerging to enterprise—and authentic value for their audiences.
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">Selective</div>
              <div className="text-sm text-muted-foreground">Creator Network</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">3+ Month</div>
              <div className="text-sm text-muted-foreground">Average Contracts</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">$5-40K</div>
              <div className="text-sm text-muted-foreground">Monthly Partnerships</div>
            </div>
            <div className="text-center">
              <div className="font-serif text-2xl md:text-3xl font-bold text-primary">Win-Win</div>
              <div className="text-sm text-muted-foreground">Performance Focus</div>
            </div>
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <Button
              size="lg"
              onClick={() => scrollToSection("brands")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6"
            >
              Partner with Eight6
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("creators")}
              className="border-primary text-primary hover:bg-primary/5 text-base px-8 py-6"
            >
              Apply as Creator
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
          <button
            onClick={() => scrollToSection("problem")}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="text-sm">Scroll to explore</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
