const items = [
  "AUTHENTIC PARTNERSHIPS",
  "TALENT-FIRST",
  "MEASURABLE RESULTS",
  "NOT ANOTHER AGENCY",
  "REAL AUDIENCES",
  "UNDERGROUND CRAFT",
  "ABOVE-GROUND RESULTS",
  "CONTENT THAT LANDS",
  "AUTHENTIC PARTNERSHIPS",
  "TALENT-FIRST",
  "MEASURABLE RESULTS",
  "NOT ANOTHER AGENCY",
  "REAL AUDIENCES",
  "UNDERGROUND CRAFT",
  "ABOVE-GROUND RESULTS",
  "CONTENT THAT LANDS",
];

const MarqueeSection = () => (
  <section
    style={{
      backgroundColor: "var(--indigo)",
      padding: "1.5rem 0",
      overflow: "hidden",
      borderTop: "2px solid var(--dark-brown)",
      borderBottom: "2px solid var(--dark-brown)",
    }}
  >
    <div className="animate-marquee" style={{ gap: 0 }}>
      {items.map((item, i) => (
        <span
          key={i}
          style={{
            flexShrink: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(0.9rem, 2vw, 1.4rem)",
            textTransform: "uppercase",
            color: "var(--lemon)",
            letterSpacing: "0.05em",
            padding: "0 2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
          }}
        >
          {item}
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              backgroundColor: "var(--lime)",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
        </span>
      ))}
    </div>
  </section>
);

export default MarqueeSection;
