const ProblemSection = () => {
  return (
    <section id="problem" className="section-padding bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl mb-12">
            WE FIXED WHAT'S BROKEN IN <span className="text-accent">CREATOR MARKETING</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* The Problem */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl md:text-3xl text-accent">THE PROBLEM</h3>
              <p className="font-script text-2xl md:text-3xl text-primary-foreground/90 leading-relaxed">
                Most creator marketing delivers awareness but little to no measurable impact. One-off partnerships feel inauthentic and produce inconsistent results.
              </p>
            </div>
            
            {/* The Solution */}
            <div className="space-y-6">
              <h3 className="font-display text-2xl md:text-3xl text-accent">OUR SOLUTION</h3>
              <p className="font-script text-2xl md:text-3xl text-primary-foreground/90 leading-relaxed">
                Eight-Six Media delivers bottom-line impact through selective, long-term creator partnerships built on authenticity and proven performance.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mt-20 border-l-4 border-accent pl-8">
            <blockquote className="font-script text-3xl md:text-4xl text-primary-foreground/90">
              "Our mission is to leave an impression on as many human lives as possible through creator partnerships that deliver genuine value."
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;