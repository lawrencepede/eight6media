import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { creators, verticals } from "@/data/creators";

const TalentSection = () => {
  return (
    <section id="talent" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary mb-4">
            OUR <span className="text-accent">TALENT</span>
          </h2>
          <p className="font-script text-2xl md:text-3xl text-muted-foreground">
            A selective network of creators who deliver authentic value and measurable results.
          </p>
        </div>

        {/* Creator Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {creators.slice(0, 3).map((creator, index) => (
            <div
              key={index}
              className="group bg-card overflow-hidden border border-border hover:border-accent transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl text-primary">
                  <a
                    href={`https://instagram.com/${creator.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {creator.name.toUpperCase()}
                  </a>
                </h3>
                <a
                  href={`https://instagram.com/${creator.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-script text-xl block hover:underline"
                >
                  {creator.instagramHandle}
                </a>
                <p className="font-script text-xl text-muted-foreground mb-4">
                  {creator.tagline}
                </p>
                
                <div className="space-y-1 font-sans text-sm text-muted-foreground mb-4">
                  <p>{creator.followers}, {creator.impressions}</p>
                  <p>{creator.audience}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {creator.partners.slice(0, 3).map((partner, i) => (
                    <BrandLogo key={i} brand={partner} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Roster CTA */}
        <div className="text-center mb-16">
          <Button variant="outline" className="group rounded-none font-display tracking-wide border-2" asChild>
            <Link to="/roster">
              VIEW FULL ROSTER
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Verticals */}
        <div className="max-w-4xl mx-auto">
          <h3 className="font-display text-2xl text-primary text-center mb-8">
            OUR VERTICALS
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {verticals.map((vertical, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border-2 border-accent px-4 py-2"
              >
                <span className="text-accent font-display">✓</span>
                <span className="font-script text-xl text-foreground">{vertical}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalentSection;