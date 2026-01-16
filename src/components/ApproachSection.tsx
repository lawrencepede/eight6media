const steps = [
  {
    number: "01",
    title: "Authentic Alignment",
    description:
      "We match brands with creators who genuinely use and love your products—ensuring partnerships feel natural to their audiences.",
  },
  {
    number: "02",
    title: "Strategic Content",
    description:
      "Our team provides content strategy, scripting using psychological selling techniques, and performance optimization to drive conversions.",
  },
  {
    number: "03",
    title: "Measurable Results",
    description:
      "Average 3-month contracts ranging from $5K to $40K/month with performance tracking—whether your goal is brand awareness, engagement, or direct sales.",
  },
];

const ApproachSection = () => {
  return (
    <section id="approach" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4">
            Our <span className="italic text-accent">Approach</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A proven three-step process for partnerships that deliver real results.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-6 md:gap-10 mb-12 last:mb-0"
            >
              {/* Step number */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center">
                  <span className="font-serif text-2xl md:text-3xl font-bold text-accent-foreground">
                    {step.number}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-16 bg-accent/30 mx-auto mt-4" />
                )}
              </div>

              {/* Content */}
              <div className="pt-3 md:pt-5">
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;
