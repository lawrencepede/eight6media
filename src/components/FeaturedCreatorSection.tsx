import mattPhoto from "@/assets/matt-photo.png";

const FeaturedCreatorSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="relative max-w-6xl mx-auto">
          {/* Name behind image - positioned absolutely */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <h2 className="font-display text-[8rem] md:text-[14rem] lg:text-[18rem] text-primary/10 leading-none tracking-tight whitespace-nowrap select-none">
              MATT CHOI
            </h2>
          </div>

          {/* Content grid with image overlapping the text */}
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            {/* Image - positioned to overlap the background text */}
            <div className="relative">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={mattPhoto}
                  alt="Matt Choi"
                  className="w-full h-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              {/* Instagram handle with accent */}
              <div className="absolute bottom-6 left-6 right-6">
                <a
                  href="https://instagram.com/mattchoi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-2 border-primary-foreground bg-primary/80 backdrop-blur-sm px-4 py-2 font-script text-xl text-primary-foreground hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors"
                >
                  @mattchoi
                </a>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="font-display text-sm text-accent tracking-widest mb-2">FEATURED CREATOR</p>
                <h3 className="font-display text-5xl md:text-6xl lg:text-7xl text-primary">
                  MATT CHOI
                </h3>
              </div>
              
              <p className="font-script text-3xl md:text-4xl text-muted-foreground">
                Endurance Athlete
              </p>
              
              <div className="space-y-4 font-sans text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-primary">400K+</span>
                  <span className="font-script text-xl">Followers</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-primary">10-11M</span>
                  <span className="font-script text-xl">Monthly Impressions</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-primary">80%</span>
                  <span className="font-script text-xl">Male, Ages 25-44</span>
                </div>
              </div>

              {/* Partner logos text */}
              <div className="pt-4 border-t border-border">
                <p className="font-script text-xl text-muted-foreground mb-3">Previous Partners</p>
                <div className="flex flex-wrap gap-4">
                  {["Nike", "Lululemon", "Apple", "Garmin"].map((partner) => (
                    <span
                      key={partner}
                      className="font-display text-sm tracking-wide text-primary border border-primary px-3 py-1"
                    >
                      {partner.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCreatorSection;