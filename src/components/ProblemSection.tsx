import elizabethPhoto from "@/assets/elizabeth-photo.png";
import { Button } from "@/components/ui/button";

const ProblemSection = () => {
  return (
    <section id="problem" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start max-w-6xl mx-auto">
          {/* Left — text content */}
          <div className="space-y-8">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary leading-[0.95]">
              WE'RE EIGHT-SIX MEDIA. LET'S BUILD SOMETHING <span className="text-accent">REAL.</span>
            </h2>
            <p className="font-sans text-base md:text-lg text-muted-foreground leading-relaxed uppercase tracking-wide">
              Our mission is to leave an impression on as many human lives as possible through creator partnerships that deliver genuine value — not vanity metrics.
            </p>
            <Button
              variant="outline"
              className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 font-display tracking-wider text-sm"
              onClick={() => window.open("https://calendly.com", "_blank")}
            >
              VIEW OUR WORK
            </Button>
          </div>

          {/* Right — image */}
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={elizabethPhoto}
              alt="Elizabeth Martin, Founder"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
