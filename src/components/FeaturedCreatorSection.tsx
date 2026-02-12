import MarqueeBanner from "@/components/MarqueeBanner";
import mattPhoto from "@/assets/matt-photo.png";

const FeaturedCreatorSection = () => {
  return (
    <>
      {/* Marquee banner */}
      <MarqueeBanner 
        text="AUTHENTICITY DRIVES SALES" 
        bgClass="bg-accent" 
        textClass="text-accent-foreground" 
      />

      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="font-display text-3xl md:text-5xl text-primary mb-4">MEET THE FOUNDER</h2>
          <p className="font-sans text-sm md:text-base text-muted-foreground uppercase tracking-wide leading-relaxed max-w-2xl mb-12">
            Elizabeth Martin built Eight-Six Media after managing creator marketing in-house and recognizing what was missing — authenticity, measurable results, and long-term vision.
          </p>

          {/* Large portrait */}
          <div className="aspect-[4/5] md:aspect-[16/10] overflow-hidden mb-0">
            <img
              src={mattPhoto}
              alt="Elizabeth Martin, Founder"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* Second marquee */}
      <MarqueeBanner 
        text="RAW CREATORS • REAL RESULTS" 
        bgClass="bg-accent" 
        textClass="text-accent-foreground" 
      />

      {/* Big statement section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="font-display text-4xl md:text-6xl lg:text-8xl leading-[0.95]">
            INSPIRING <span className="text-accent">STRENGTH</span> AND BUILDING COMMUNITY THROUGH <span className="text-accent">CREATORS</span>
          </h2>
        </div>
      </section>
    </>
  );
};

export default FeaturedCreatorSection;
