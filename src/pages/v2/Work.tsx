import { useState } from "react";
import Navigation from "@/components/v2/Navigation";
import Footer from "@/components/v2/Footer";
import CTASection from "@/components/v2/CTASection";

interface Item {
  id: number;
  brand: string;
  talent: string;
  thumbnail: string;
  vertical: string;
}

const items: Item[] = [
  { id: 1, brand: "NOBULL",    talent: "Joey Mucchio",     vertical: "Performance",       thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=900&fit=crop" },
  { id: 2, brand: "Garmin",    talent: "Sarah Chen",       vertical: "Endurance",         thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=900&fit=crop" },
  { id: 3, brand: "Nike",      talent: "Marcus Williams",  vertical: "Run Culture",       thumbnail: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=900&fit=crop" },
  { id: 4, brand: "Lululemon", talent: "Emma Rodriguez",   vertical: "Wellness",          thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=900&fit=crop" },
  { id: 5, brand: "Whoop",     talent: "David Park",       vertical: "Recovery",          thumbnail: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=900&fit=crop" },
  { id: 6, brand: "Apple",     talent: "Lisa Thompson",    vertical: "Tech",              thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=900&fit=crop" },
];

const Card = ({ item }: { item: Item }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", cursor: "pointer", backgroundColor: "var(--dark-brown)" }}
    >
      <div style={{ position: "relative", aspectRatio: "3 / 4", overflow: "hidden" }}>
        <img
          src={item.thumbnail}
          alt={`${item.brand} × ${item.talent}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: hover ? "saturate(1) brightness(0.95)" : "saturate(0.85) brightness(0.85)",
            transform: hover ? "scale(1.04)" : "scale(1)",
            transition: "transform 600ms ease, filter 300ms ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(66,30,24,0.85) 0%, rgba(66,30,24,0) 55%)",
          }}
        />
        <span
          className="label"
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            color: "var(--lemon)",
            opacity: 0.85,
            backgroundColor: "rgba(66,30,24,0.55)",
            padding: "0.35rem 0.65rem",
            border: "1px solid rgba(243,255,183,0.3)",
          }}
        >
          {item.vertical}
        </span>
      </div>
      <div style={{ padding: "1.25rem 1.25rem 1.5rem" }}>
        <p
          style={{
            fontFamily: "var(--font-display-cond)",
            fontWeight: 500,
            fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)",
            textTransform: "uppercase",
            color: "var(--lemon)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {item.brand}{" "}
          <span style={{ color: "var(--lime)", margin: "0 0.35em" }}>×</span>{" "}
          <span style={{ opacity: 0.85 }}>{item.talent}</span>
        </p>
      </div>
    </div>
  );
};

const Work = () => (
  <div className="v2-root" style={{ minHeight: "100svh" }}>
    <Navigation />

    {/* Hero — sky ground */}
    <section style={{ backgroundColor: "var(--sky)", padding: "9rem 2rem 5rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}>
          Our work
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(3rem, 10vw, 8rem)",
            color: "var(--dark-brown)",
            lineHeight: 0.92,
            textTransform: "uppercase",
            margin: 0,
            maxWidth: "16ch",
          }}
        >
          FEATURED
          <br />
          COLLABORATIONS.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
            color: "var(--dark-brown)",
            opacity: 0.8,
            lineHeight: 1.7,
            maxWidth: 540,
            marginTop: "1.75rem",
          }}
        >
          A showcase of authentic partnerships between leading brands and our roster of creators.
        </p>
      </div>
    </section>

    {/* Grid — dark brown ground */}
    <section style={{ backgroundColor: "var(--dark-brown)", padding: "5rem 2rem 7rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {items.map((it) => (
            <Card key={it.id} item={it} />
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            color: "var(--lime)",
            transform: "rotate(-1.5deg)",
            display: "inline-block",
            marginTop: "3.5rem",
          }}
        >
          briefs that breathe. content that lands.
        </p>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
);

export default Work;
