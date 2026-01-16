import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePitches } from "@/hooks/usePitches";
import { getCreatorsByIds } from "@/data/creators";
import BrandLogo from "@/components/BrandLogo";

const Pitch = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPitchBySlug } = usePitches();
  
  const pitch = slug ? getPitchBySlug(slug) : undefined;
  const selectedCreators = pitch ? getCreatorsByIds(pitch.creatorIds) : [];

  if (!pitch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-primary mb-4">
            Pitch Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This pitch may have been removed or the link is incorrect.
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Eight6 Media</span>
            </Link>
            <Button size="sm" asChild>
              <a href="mailto:hello@eight6media.com">
                <Mail className="w-4 h-4 mr-2" />
                Get in Touch
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent font-medium mb-4">Prepared for {pitch.brandName}</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6">
            {pitch.headline || `Curated Creators for ${pitch.brandName}`}
          </h1>
          {pitch.description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {pitch.description}
            </p>
          )}
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-primary">
                    {creator.name}
                  </h3>
                  <p className="text-accent text-sm font-medium mb-3">
                    {creator.tagline}
                  </p>
                  
                  {creator.bio && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {creator.bio}
                    </p>
                  )}

                  <div className="space-y-3 text-sm border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Followers</span>
                      <span className="font-medium text-primary">{creator.followers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Impressions</span>
                      <span className="font-medium text-primary">{creator.impressions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience</span>
                      <span className="font-medium text-primary">{creator.audience}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Past Partners</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {creator.partners.map((partner, i) => (
                        <BrandLogo key={i} brand={partner} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-4">
            Ready to Partner?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss how these creators can help tell your brand's story.
          </p>
          <Button size="lg" asChild>
            <a href="mailto:hello@eight6media.com">
              <Mail className="w-5 h-5 mr-2" />
              Get in Touch
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Eight6 Media. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Pitch;
