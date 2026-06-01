import Navigation from "@/components/v2/Navigation";
import Footer from "@/components/v2/Footer";
import CTASection from "@/components/v2/CTASection";

const offerings = [
  { num: "01", title: "Premium Partnerships", body: "Multi-month contracts averaging $5–40K/month — some of the biggest deals in the space for medium-sized creators." },
  { num: "02", title: "Strategic Growth", body: "Content strategy and audience building support to maximise your earning potential." },
  { num: "03", title: "Brand Alignment", body: "Only partnerships that fit your authentic voice and add value to your community." },
  { num: "04", title: "Proven Results", body: "Our creators see significant follower growth and sustainable revenue increases." },
];

const ForCreators = () => (
  <div className="v2-root" style={{ minHeight: "100svh" }}>
    <Navigation />

    {/* Hero — mauve ground */}
    <section style={{ backgroundColor: "var(--mauve)", padding: "9rem 2rem 6rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}>
          For Creators · Application required
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
            maxWidth: "14ch",
          }}
        >
          A SELECTIVE
          <br />
          NETWORK.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
            color: "var(--indigo)",
            transform: "rotate(-2deg)",
            display: "inline-block",
            marginTop: "1.5rem",
          }}
        >
          not for everyone — by design.
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
            color: "var(--dark-brown)",
            opacity: 0.8,
            lineHeight: 1.7,
            maxWidth: 520,
            marginTop: "1.5rem",
          }}
        >
          We maintain quality through selective standards. If you build genuine trust with your audience, we want to talk.
        </p>
      </div>
    </section>

    {/* Offerings — lemon */}
    <section style={{ backgroundColor: "var(--lemon)", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
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
            WHAT YOU GET
          </h2>
          <p className="label" style={{ color: "var(--indigo)", opacity: 0.65 }}>
            Offerings
          </p>
        </div>

        {offerings.map(({ num, title, body }) => (
          <div
            key={num}
            style={{
              display: "grid",
              gridTemplateColumns: "3rem 1fr 1.4fr",
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
                fontSize: "clamp(1.25rem, 2.2vw, 2rem)",
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
                opacity: 0.75,
                lineHeight: 1.7,
              }}
            >
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* Apply CTA — dark brown */}
    <section style={{ backgroundColor: "var(--dark-brown)", padding: "8rem 2rem", position: "relative", overflow: "hidden" }}>
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
        86.
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <p className="label" style={{ color: "var(--lemon)", opacity: 0.45, marginBottom: "1.5rem" }}>
          Apply
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2.5rem, 7vw, 6rem)",
            color: "var(--lemon)",
            lineHeight: 0.95,
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "2rem",
            maxWidth: "16ch",
          }}
        >
          READY TO ELEVATE YOUR PARTNERSHIPS?
        </h2>
        <a
          href="mailto:elizabeth@eight6media.com?subject=Creator Application"
          style={{
            display: "inline-block",
            backgroundColor: "var(--lime)",
            color: "var(--dark-brown)",
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            padding: "1.1rem 2.5rem",
            fontWeight: 700,
            marginTop: "1rem",
          }}
        >
          Apply to Join Eight-Six →
        </a>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
);

export default ForCreators;
