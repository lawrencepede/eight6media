import { useState, useMemo } from "react";
import Navigation from "@/components/v2/Navigation";
import Footer from "@/components/v2/Footer";
import CTASection from "@/components/v2/CTASection";
import { creators, verticals, getActiveCreators } from "@/data/creators";
import type { Creator } from "@/data/creators";

const CreatorCard = ({ creator, onClick }: { creator: Creator; onClick: () => void }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        background: "var(--lemon)",
        border: "1px solid rgba(66,30,24,0.18)",
        padding: 0,
        cursor: "pointer",
        display: "block",
        width: "100%",
      }}
    >
      <div style={{ aspectRatio: "4 / 5", overflow: "hidden", position: "relative" }}>
        <img
          src={creator.image}
          alt={creator.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hover ? "scale(1.04)" : "scale(1)",
            transition: "transform 500ms ease",
            filter: "saturate(0.9)",
          }}
        />
        <span
          className="label"
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            backgroundColor: "var(--dark-brown)",
            color: "var(--lemon)",
            padding: "0.3rem 0.55rem",
          }}
        >
          {creator.metrics?.igFollowers || creator.followers}
        </span>
      </div>
      <div style={{ padding: "1rem 1.1rem 1.25rem", borderTop: "1px solid rgba(66,30,24,0.18)" }}>
        <h3
          style={{
            fontFamily: "var(--font-display-cond)",
            fontWeight: 500,
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            textTransform: "uppercase",
            color: "var(--dark-brown)",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {creator.name}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "var(--dark-brown)",
            opacity: 0.65,
            margin: "0.35rem 0 0.75rem",
          }}
        >
          {creator.tagline}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {creator.verticals.slice(0, 2).map((v, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--indigo)",
                border: "1px solid var(--indigo)",
                padding: "0.25rem 0.55rem",
              }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

const Roster = () => {
  const [activeVertical, setActiveVertical] = useState<string | null>(null);
  const [selected, setSelected] = useState<Creator | null>(null);
  const active = getActiveCreators();

  const filtered = useMemo(
    () =>
      activeVertical
        ? active.filter((c) => c.verticals.includes(activeVertical))
        : active,
    [active, activeVertical]
  );

  return (
    <div className="v2-root" style={{ minHeight: "100svh" }}>
      <Navigation />

      {/* Hero — olive ground */}
      <section style={{ backgroundColor: "var(--olive)", padding: "9rem 2rem 5rem" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}>
            Talent · {active.length} active
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
            THE ROSTER.
          </h1>
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
              color: "var(--indigo)",
              transform: "rotate(-2deg)",
              display: "inline-block",
              marginTop: "1.25rem",
            }}
          >
            carefully chosen. quietly powerful.
          </p>
        </div>
      </section>

      {/* Filter bar — lemon */}
      <section
        style={{
          backgroundColor: "var(--lemon)",
          padding: "1.5rem 2rem",
          borderBottom: "1px solid rgba(66,30,24,0.18)",
          position: "sticky",
          top: 64,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <span className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginRight: "0.75rem" }}>
            Filter:
          </span>
          <button
            onClick={() => setActiveVertical(null)}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "0.5rem 0.85rem",
              border: "1px solid var(--dark-brown)",
              cursor: "pointer",
              backgroundColor: activeVertical === null ? "var(--dark-brown)" : "transparent",
              color: activeVertical === null ? "var(--lemon)" : "var(--dark-brown)",
            }}
          >
            All
          </button>
          {verticals.map((v) => (
            <button
              key={v}
              onClick={() => setActiveVertical(v === activeVertical ? null : v)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding: "0.5rem 0.85rem",
                border: "1px solid var(--dark-brown)",
                cursor: "pointer",
                backgroundColor: activeVertical === v ? "var(--dark-brown)" : "transparent",
                color: activeVertical === v ? "var(--lemon)" : "var(--dark-brown)",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      {/* Grid — peach ground */}
      <section style={{ backgroundColor: "var(--peach)", padding: "4rem 2rem 7rem" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {filtered.map((c) => (
              <CreatorCard key={c.id} creator={c} onClick={() => setSelected(c)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--dark-brown)",
                opacity: 0.7,
                textAlign: "center",
                padding: "4rem 0",
              }}
            >
              No creators match this filter.
            </p>
          )}
        </div>
      </section>

      {/* Detail modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(66,30,24,0.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--lemon)",
              maxWidth: 900,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
              border: "1px solid var(--dark-brown)",
            }}
          >
            <img
              src={selected.image}
              alt={selected.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 320 }}
            />
            <div style={{ padding: "2rem" }}>
              <p className="label" style={{ color: "var(--rust)", marginBottom: "0.75rem" }}>
                {selected.location}
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                  textTransform: "uppercase",
                  color: "var(--dark-brown)",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {selected.name}
              </h3>
              <a
                href={`https://instagram.com/${selected.instagramHandle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "var(--indigo)",
                  display: "inline-block",
                  marginTop: "0.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                {selected.instagramHandle} →
              </a>
              {selected.bio && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--dark-brown)",
                    opacity: 0.8,
                    lineHeight: 1.65,
                    fontSize: "0.95rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {selected.bio}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  borderTop: "1px solid rgba(66,30,24,0.2)",
                  paddingTop: "1.25rem",
                }}
              >
                {selected.metrics?.igFollowers && (
                  <div>
                    <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.55 }}>
                      IG Followers
                    </p>
                    <p style={{ fontFamily: "var(--font-display-cond)", fontSize: "1.5rem", color: "var(--dark-brown)", margin: "0.35rem 0 0" }}>
                      {selected.metrics.igFollowers}
                    </p>
                  </div>
                )}
                {selected.metrics?.engagementRate && (
                  <div>
                    <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.55 }}>
                      Engagement
                    </p>
                    <p style={{ fontFamily: "var(--font-display-cond)", fontSize: "1.5rem", color: "var(--dark-brown)", margin: "0.35rem 0 0" }}>
                      {selected.metrics.engagementRate}
                    </p>
                  </div>
                )}
              </div>

              {selected.partners.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.55, marginBottom: "0.5rem" }}>
                    Brand partners
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {selected.partners.map((p, i) => (
                      <span
                        key={i}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.75rem",
                          color: "var(--dark-brown)",
                          border: "1px solid var(--dark-brown)",
                          padding: "0.25rem 0.55rem",
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelected(null)}
                style={{
                  marginTop: "2rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  backgroundColor: "var(--dark-brown)",
                  color: "var(--lemon)",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <CTASection />
      <Footer />
    </div>
  );
};

export default Roster;
