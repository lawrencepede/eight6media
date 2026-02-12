import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import forestPhoto from "@/assets/photo-forest.png";

const CTASection = () => {
  return (
    <section className="relative py-32 md:py-40 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={forestPhoto} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] max-w-3xl mx-auto mb-8">
          Ready to make an <em className="italic text-accent">impact?</em>
        </h2>
        <p className="font-sans text-sm md:text-base text-foreground/70 max-w-lg mx-auto mb-12">
          Whether you're a brand looking for measurable results or a creator ready for premium partnerships.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="rounded-none bg-foreground text-background hover:bg-accent hover:text-accent-foreground px-10 py-6 font-sans text-xs tracking-[0.2em] uppercase"
            onClick={() => window.open("https://calendly.com", "_blank")}
          >
            Partner With Us
          </Button>
          <Button
            className="rounded-none bg-transparent border border-foreground/40 text-foreground hover:bg-foreground hover:text-background px-10 py-6 font-sans text-xs tracking-[0.2em] uppercase"
            asChild
          >
            <Link to="/for-creators">Apply as Creator</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
