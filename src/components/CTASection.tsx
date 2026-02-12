import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bokehPhoto from "@/assets/photo-bokeh.png";
import forestPhoto from "@/assets/photo-forest.png";

const CTASection = () => {
  return (
    <section id="contact" className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background image strip */}
      <div className="absolute inset-0 opacity-10">
        <img src={forestPhoto} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary mb-8">
            READY TO MAKE AN <span className="text-accent">IMPACT?</span>
          </h2>
          <p className="font-sans text-base md:text-lg text-muted-foreground uppercase tracking-wide max-w-xl mx-auto mb-12">
            Whether you're a brand looking for measurable results or a creator ready for premium partnerships.
          </p>

          {/* Bokeh accent image */}
          <div className="w-full aspect-[16/5] overflow-hidden mb-12">
            <img src={bokehPhoto} alt="City lights" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground px-10 py-6 font-display tracking-wider text-sm"
              onClick={() => window.open("https://calendly.com", "_blank")}
            >
              PARTNER WITH US
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-6 font-display tracking-wider text-sm"
              asChild
            >
              <Link to="/for-creators">APPLY AS CREATOR</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
