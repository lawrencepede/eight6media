import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { creators, verticals } from "@/data/creators";

const TalentSection = () => {
  return (
    <section id="talent" className="section-padding bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-4">
            Our <span className="italic text-accent">Talent</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A selective network of creators who deliver authentic value and measurable results.
          </p>
        </div>

        {/* Creator Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {creators.slice(0, 3).map((creator, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
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
                <h3 className="font-serif text-xl font-semibold text-primary">
                  <a
                    href={`https://instagram.com/${creator.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {creator.name}
                  </a>
                </h3>
                <a
                  href={`https://instagram.com/${creator.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent text-sm font-medium mb-4 block hover:underline"
                >
                  {creator.instagramHandle}
                </a>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
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
          <Button variant="outline" className="group" asChild>
            <Link to="/roster">
              View Full Roster
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Verticals */}
        <div className="max-w-4xl mx-auto">
          <h3 className="font-serif text-2xl font-semibold text-primary text-center mb-8">
            Our Verticals
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {verticals.map((vertical, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full"
              >
                <span className="text-accent">✓</span>
                <span className="text-foreground font-medium">{vertical}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalentSection;
