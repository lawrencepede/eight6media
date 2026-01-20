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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24">
      {/* Minimal geometric accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main headline - Bold Anton uppercase */}
          <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] font-bold text-primary leading-[0.9] mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            RAW
            <br />
            <span className="text-accent">CREATORS.</span>
          </h1>

          {/* Script tagline */}
          <p className="font-script text-3xl md:text-4xl lg:text-5xl text-muted-foreground mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            Impact focus, authentic stories.
          </p>

          {/* Description */}
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            We're a selective creator agency representing trusted creators who deliver measurable results for brands—from emerging to enterprise.
          </p>

          {/* Key stats - clean, minimal */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 opacity-0 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="border-l-2 border-accent pl-4">
              <div className="font-display text-2xl md:text-3xl text-primary">SELECTIVE</div>
              <div className="font-script text-lg md:text-xl text-muted-foreground">Creator Network</div>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <div className="font-display text-2xl md:text-3xl text-primary">3+ MONTH</div>
              <div className="font-script text-lg md:text-xl text-muted-foreground">Average Contracts</div>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <div className="font-display text-2xl md:text-3xl text-primary">$5-40K</div>
              <div className="font-script text-lg md:text-xl text-muted-foreground">Monthly Partnerships</div>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <div className="font-display text-2xl md:text-3xl text-primary">WIN-WIN</div>
              <div className="font-script text-lg md:text-xl text-muted-foreground">Performance Focus</div>
            </div>
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-24 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <Button
              size="lg"
              onClick={() => scrollToSection("brands")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-6 rounded-none font-display tracking-wider"
            >
              PARTNER WITH US
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("creators")}
              className="border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground hover:border-accent text-base px-10 py-6 rounded-none font-display tracking-wider"
            >
              APPLY AS CREATOR
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
          <button
            onClick={() => scrollToSection("problem")}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="font-script text-lg">scroll to explore</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;