const ProblemSection = () => {
  return (
    <section id="problem" className="section-padding bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-center">
            We Fixed What's Broken in <span className="italic text-accent">Influencer Marketing</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* The Problem */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-accent">The Problem</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Most influencer marketing delivers awareness but little to no measurable impact. One-off partnerships feel inauthentic and produce inconsistent results. Brands struggle to find creators who genuinely align with their values and can drive real conversions.
              </p>
            </div>
            
            {/* The Solution */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-accent">Our Solution</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                Eight6Media delivers bottom-line impact through selective, long-term creator partnerships built on authenticity, alignment of interests, and proven performance. We go beyond vanity metrics to create partnerships that drive real, measurable results.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mt-16 text-center">
            <blockquote className="font-serif text-xl md:text-2xl italic text-primary-foreground/90 max-w-3xl mx-auto">
              "Our mission is to leave an impression on as many human lives as possible through creator partnerships that deliver genuine value for audiences and bottom-line impact for brands."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
