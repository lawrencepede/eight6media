import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section id="contact" className="section-padding bg-accent">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-accent-foreground mb-8">
            Ready to Make an Impact?
          </h2>

          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* For Brands */}
            <div className="bg-background rounded-2xl p-8 text-left">
              <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                For Brands
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Let's discuss how our authentic creators can deliver measurable results for your marketing objectives.
              </p>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                Schedule a Discovery Call
              </Button>
            </div>

            {/* For Creators */}
            <div className="bg-background rounded-2xl p-8 text-left">
              <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                For Creators
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Apply to join our selective network and access premium, multi-month partnership opportunities.
              </p>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/5"
                onClick={() => window.open("https://calendly.com", "_blank")}
              >
                Start Your Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
