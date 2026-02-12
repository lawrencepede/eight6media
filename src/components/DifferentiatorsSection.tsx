import amandaPhoto from "@/assets/amanda-photo.png";
import jaimePhoto from "@/assets/jaime-photo.png";

const differentiators = [
  {
    number: "01",
    title: "PERFORMANCE-FOCUSED RESULTS",
    description:
      "We structure partnerships to deliver measurable impact — from brand awareness to direct sales conversions.",
  },
  {
    number: "02",
    title: "SELECTIVE CREATOR NETWORK",
    description:
      "We represent carefully vetted creators who align with our authenticity standards and cultivate extremely loyal followings.",
  },
  {
    number: "03",
    title: "FULL-SERVICE PARTNERSHIPS",
    description:
      "Content strategy, psychological selling techniques, scripting, audience building, and end-to-end oversight.",
  },
];

const DifferentiatorsSection = () => {
  return (
    <>
      {/* Image + big text overlay section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="w-full aspect-[16/9] md:aspect-[16/7] overflow-hidden relative">
          <img
            src={amandaPhoto}
            alt="Creator in action"
            className="w-full h-full object-cover"
          />
          {/* Overlapping text at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8">
            <h2 className="font-display text-primary-foreground text-[3rem] sm:text-[5rem] md:text-[8rem] lg:text-[10rem] leading-[0.85] tracking-tight italic">
              EXPLORE CREATORS
            </h2>
          </div>
          {/* Full-width citron CTA bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <button 
              className="w-full bg-primary py-4 font-display text-sm md:text-base tracking-widest text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => window.open("https://calendly.com", "_blank")}
            >
              VIEW OUR TALENT
            </button>
          </div>
        </div>
      </section>

      {/* Two-column image grid */}
      <section className="bg-background py-4 px-4">
        <div className="grid grid-cols-2 gap-4 max-w-6xl mx-auto">
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={jaimePhoto}
              alt="Creator content"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="aspect-[3/4] overflow-hidden mb-6">
              <img
                src={amandaPhoto}
                alt="Creator collaboration"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-display text-2xl md:text-3xl text-primary mb-3">
              AUTHENTIC PARTNERSHIPS
            </h3>
            <p className="font-sans text-sm md:text-base text-muted-foreground uppercase tracking-wide leading-relaxed">
              3-month contracts ranging from $5K to $40K/month with performance tracking and full creative support.
            </p>
          </div>
        </div>
      </section>

      {/* Differentiators list */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl mb-16 text-accent">
            BEYOND THE VANITY METRICS
          </h2>
          
          <div className="space-y-12">
            {differentiators.map((item) => (
              <div
                key={item.number}
                className="flex gap-6 md:gap-10 border-t border-primary-foreground/20 pt-8"
              >
                <span className="font-display text-4xl md:text-5xl text-accent/60">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl text-primary-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="font-sans text-base md:text-lg text-primary-foreground/70 leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default DifferentiatorsSection;
