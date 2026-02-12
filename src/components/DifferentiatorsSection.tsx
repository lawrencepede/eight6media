import sunsetPhoto from "@/assets/photo-sunset.png";
import forestPhoto from "@/assets/photo-forest.png";

const differentiators = [
  {
    title: "Performance-Focused Results",
    description:
      "We structure partnerships to deliver measurable impact — from brand awareness to direct sales conversions.",
  },
  {
    title: "Selective Creator Network",
    description:
      "We represent carefully vetted creators who align with our authenticity standards and cultivate loyal followings.",
  },
  {
    title: "Full-Service Partnerships",
    description:
      "Content strategy, scripting, audience building, and end-to-end oversight — all handled for you.",
  },
];

const DifferentiatorsSection = () => {
  return (
    <>
      {/* Full-width accent band */}
      <section className="bg-accent py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-accent-foreground leading-[1.1]">
            Beyond the vanity metrics.
          </h2>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="space-y-0">
            {differentiators.map((item, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 border-t border-border py-10"
              >
                <h3 className="font-display text-2xl md:text-3xl text-foreground md:w-1/2">
                  {item.title}
                </h3>
                <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed md:w-1/2">
                  {item.description}
                </p>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* Full-bleed image */}
      <section className="relative">
        <div className="aspect-[16/7] overflow-hidden">
          <img src={sunsetPhoto} alt="Sunset" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/30" />
        </div>
      </section>
    </>
  );
};

export default DifferentiatorsSection;
