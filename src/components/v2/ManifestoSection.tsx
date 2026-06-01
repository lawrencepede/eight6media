const ManifestoSection = () => {
  const statements = [
    { not: "Not vanity metrics.", is: "Measurable results." },
    { not: "Not copy-paste briefs.", is: "Genuine strategy." },
    { not: "Not chasing reach.", is: "Building trust." },
  ];

  return (
    <section
      style={{
        backgroundColor: "var(--sky)",
        padding: "6rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(66,30,24,0.03) 40px, rgba(66,30,24,0.03) 41px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%", position: "relative" }}>
        <p
          className="label"
          style={{ color: "var(--indigo)", marginBottom: "2.5rem", opacity: 0.7 }}
        >
          What we actually are
        </p>

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            textTransform: "uppercase",
            color: "var(--dark-brown)",
            lineHeight: 0.93,
            letterSpacing: "-0.01em",
            maxWidth: "14ch",
            marginBottom: "4rem",
          }}
        >
          UNDERGROUND CRAFT.
          ABOVE-GROUND RESULTS.
        </p>

        <div style={{ borderTop: "1px solid rgba(66,30,24,0.2)" }}>
          {statements.map(({ not, is }, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                borderBottom: "1px solid rgba(66,30,24,0.2)",
                padding: "1.75rem 0",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)",
                  color: "var(--dark-brown)",
                  opacity: 0.5,
                  textDecoration: "line-through",
                  textDecorationColor: "var(--rust)",
                }}
              >
                {not}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)",
                  color: "var(--dark-brown)",
                }}
              >
                {is}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(1rem, 2vw, 1.4rem)",
            color: "var(--indigo)",
            marginTop: "2.5rem",
            transform: "rotate(-2deg)",
            display: "inline-block",
          }}
        >
          and we mean it.
        </p>
      </div>
    </section>
  );
};

export default ManifestoSection;
