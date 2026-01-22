import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 md:py-32 bg-accent">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl text-accent-foreground mb-12">
            READY TO MAKE AN IMPACT?
          </h2>

          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* For Brands */}
            <div className="bg-background border-2 border-primary p-8 text-left">
              <Link to="/for-brands">
                <h3 className="font-display text-2xl text-primary mb-4 hover:text-accent transition-colors">
                  FOR BRANDS
                </h3>
              </Link>
              <p className="font-sans text-base text-muted-foreground mb-6">
                Let's discuss how our authentic creators can deliver measurable results for your marketing objectives.
              </p>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-display tracking-wide"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                SCHEDULE A DISCOVERY CALL
              </Button>
            </div>

            {/* For Creators */}
            <div className="bg-background border-2 border-primary p-8 text-left">
              <h3 className="font-display text-2xl text-primary mb-4">
                FOR CREATORS
              </h3>
              <p className="font-sans text-base text-muted-foreground mb-6">
                Apply to join our selective network and access premium, multi-month partnership opportunities.
              </p>
              <Button
                variant="outline"
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none font-display tracking-wide"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                START YOUR APPLICATION
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;