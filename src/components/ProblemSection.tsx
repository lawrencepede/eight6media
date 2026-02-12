import trainPhoto from "@/assets/photo-train.png";
import dockPhoto from "@/assets/photo-dock.png";

const ProblemSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Centered intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
            Our Approach
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
            The <em className="italic text-accent">best</em> things in life
            <br />are worth sharing.
          </h2>
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            We partner with creators who build genuine trust with their audiences — delivering partnerships that feel natural and drive real impact.
          </p>
        </div>

        {/* Two-column image grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={trainPhoto}
              alt="Motion blur train"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={dockPhoto}
              alt="Dock scene"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
