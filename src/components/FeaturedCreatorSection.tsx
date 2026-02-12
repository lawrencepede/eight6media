import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FeaturedCreatorSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Centered statement */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
            Meet the Founder
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
            Inspiring <em className="italic text-accent">strength</em> and building community through creators.
          </h2>
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Elizabeth Martin built Eight-Six Media after managing creator marketing in-house and recognizing what was missing — authenticity, measurable results, and long-term vision.
          </p>
          <Button
            className="rounded-none bg-transparent border border-foreground/40 text-foreground hover:bg-foreground hover:text-background px-10 py-6 font-sans text-xs tracking-[0.2em] uppercase"
            asChild
          >
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCreatorSection;
