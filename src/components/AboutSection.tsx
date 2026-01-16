const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4">
              About <span className="italic text-accent">Eight6Media</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Founder image placeholder */}
            <div className="aspect-[4/5] bg-secondary rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=625&fit=crop&crop=face"
                alt="Elizabeth Martin, Founder"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Story */}
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
                  Founded by Elizabeth Martin
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded in 2023, Eight6Media has grown solely through word of mouth by creating value for creators and their audiences while delivering measurable results for brand partners.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We believe authenticity is the single most important factor for conversions and long-term audience loyalty.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our team has grown from one to six people in the past 12 months. We now have a killer talent & brand manager team plus a COO/CFO to take Eight6 to the next level and beyond.
                </p>
              </div>
            </div>
          </div>

          {/* The Name Origin */}
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-6">
              Why "Eight6"?
            </h3>
            <p className="text-primary-foreground/90 text-lg leading-relaxed max-w-2xl mx-auto">
              In the crucial 7 seconds to capture attention on social media—equivalent to <span className="font-serif text-accent text-2xl font-bold">8.6 heartbeats</span>—we help make lasting impressions that drive real results.
            </p>
          </div>

          {/* Mission */}
          <div className="mt-12 text-center">
            <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
              Our Mission
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Leave an impression on as many human lives as possible through creator partnerships that deliver genuine value for audiences and bottom-line impact for brands.
            </p>
          </div>

          {/* Trust signals */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="font-serif text-3xl font-bold text-primary mb-2">2023</div>
              <div className="text-sm text-muted-foreground">Founded</div>
            </div>
            <div className="p-6">
              <div className="font-serif text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Word-of-mouth growth</div>
            </div>
            <div className="p-6">
              <div className="font-serif text-3xl font-bold text-primary mb-2">6</div>
              <div className="text-sm text-muted-foreground">Team members</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
