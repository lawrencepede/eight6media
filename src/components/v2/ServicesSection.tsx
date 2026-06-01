const services = [
  {
    num: "01",
    title: "Talent Representation",
    body: "We sign and manage creators who build genuine trust with their audiences. Not chasing reach — building authority.",
  },
  {
    num: "02",
    title: "Brand Partnerships",
    body: "End-to-end campaign management. Strategy, scripting, compliance, performance tracking. Done for you.",
  },
  {
    num: "03",
    title: "Content Strategy",
    body: "Audience-first briefs that give creators room to be themselves. Better content. Better results. Every time.",
  },
  {
    num: "04",
    title: "Media & Distribution",
    body: "Placing the right content on the right platforms at the right time. Not a hunch — a system.",
  },
];

const ServicesSection = () => (
  <section
    style={{
      backgroundColor: "var(--lemon)",
      padding: "6rem 2rem",
      position: "relative",
    }}
  >
    <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "3rem",
          borderBottom: "1px solid rgba(66,30,24,0.25)",
          paddingBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            textTransform: "uppercase",
            color: "var(--dark-brown)",
            lineHeight: 0.93,
            margin: 0,
          }}
        >
          WHAT WE DO
        </h2>
        <p className="label" style={{ color: "var(--indigo)", opacity: 0.65 }}>
          Services
        </p>
      </div>

      {services.map(({ num, title, body }) => (
        <div
          key={num}
          style={{
            display: "grid",
            gridTemplateColumns: "3rem 1fr 1fr",
            gap: "2rem",
            borderBottom: "1px solid rgba(66,30,24,0.14)",
            padding: "2rem 0",
            alignItems: "start",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--rust)",
              paddingTop: "0.35em",
            }}
          >
            {num}
          </span>

          <h3
            style={{
              fontFamily: "var(--font-display-cond)",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 2.5vw, 2.25rem)",
              textTransform: "uppercase",
              color: "var(--dark-brown)",
              lineHeight: 1,
              margin: 0,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
              color: "var(--dark-brown)",
              opacity: 0.72,
              lineHeight: 1.7,
            }}
          >
            {body}
          </p>
        </div>
      ))}

      <p
        style={{
          fontFamily: "var(--font-hand)",
          fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
          color: "var(--indigo)",
          marginTop: "2rem",
          transform: "rotate(-1.5deg)",
          display: "inline-block",
        }}
      >
        talent over formula.
      </p>
    </div>
  </section>
);

export default ServicesSection;
