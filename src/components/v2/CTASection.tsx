const CTASection = () => (
  <section
    style={{
      backgroundColor: "var(--dark-brown)",
      padding: "7rem 2rem",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      aria-hidden
      style={{
        position: "absolute",
        right: "-0.05em",
        bottom: "-0.15em",
        fontFamily: "var(--font-wordmark)",
        fontSize: "clamp(8rem, 28vw, 22rem)",
        color: "var(--lemon)",
        opacity: 0.04,
        lineHeight: 1,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      NOT.
    </div>

    <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
      <p
        className="label"
        style={{ color: "var(--lemon)", opacity: 0.45, marginBottom: "1.5rem" }}
      >
        Ready?
      </p>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "clamp(2.5rem, 8vw, 7.5rem)",
          textTransform: "uppercase",
          color: "var(--lemon)",
          lineHeight: 0.93,
          maxWidth: "12ch",
          marginBottom: "2.5rem",
          margin: 0,
        }}
      >
        LET'S MAKE SOMETHING REAL.
      </h2>

      <p
        style={{
          fontFamily: "var(--font-hand)",
          fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
          color: "var(--lime)",
          transform: "rotate(-2deg)",
          display: "inline-block",
          marginTop: "2.5rem",
          marginBottom: "3rem",
        }}
      >
        no fluff. just work.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <a
          href="mailto:elizabeth@eight6media.com"
          style={{
            display: "inline-block",
            backgroundColor: "var(--mauve)",
            color: "var(--dark-brown)",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            padding: "1rem 2.25rem",
            fontWeight: 700,
            transition: "background-color 0.2s, color 0.2s",
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%)",
            backgroundSize: "4px 4px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--lime)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--mauve)";
          }}
        >
          WORK WITH US →
        </a>

        <a
          href="mailto:elizabeth@eight6media.com?subject=Creator Application"
          style={{
            display: "inline-block",
            backgroundColor: "transparent",
            color: "var(--lemon)",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            padding: "1rem 2.25rem",
            border: "1px solid rgba(243,255,183,0.35)",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--lemon)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(243,255,183,0.35)";
          }}
        >
          APPLY AS CREATOR →
        </a>
      </div>
    </div>
  </section>
);

export default CTASection;
