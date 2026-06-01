import Navigation from "@/components/v2/Navigation";
import Footer from "@/components/v2/Footer";
import CTASection from "@/components/v2/CTASection";

const benefits = [
  { title: "Proven Performance", body: "Track record of delivering measurable results across awareness and conversion campaigns." },
  { title: "Multi-Month Partnerships", body: "Average 3-month contracts delivering sustained impact and brand loyalty." },
  { title: "Strategic Support", body: "Content strategy, scripting, psychological selling techniques, and performance optimization." },
  { title: "Scalable Solutions", body: "We work with emerging brands and enterprise clients alike." },
  { title: "Authentic Partnerships", body: "Only creators who genuinely align with your brand values and marketing objectives." },
];

const steps = [
  { num: "01", title: "Authentic Alignment", body: "We match brands with creators who genuinely use and love your products — partnerships that feel natural to their audiences." },
  { num: "02", title: "Strategic Content", body: "Content strategy, scripting using psychological selling techniques, and performance optimization to drive conversions." },
  { num: "03", title: "Measurable Results", body: "Average 3-month contracts from $5K to $40K/month with full performance tracking — awareness, engagement, or direct sales." },
];

const proof = [
  { stat: "700K", label: "Followers grown from 60K", context: "Helen Leland's strategic partnership journey" },
  { stat: "36+", label: "Months of partnerships", context: "Cured Nutrition at $6K/month" },
  { stat: "100%", label: "Word-of-mouth growth", context: "Since our founding in 2023" },
];

const ForBrands = () => (
  <div className="v2-root" style={{ minHeight: "100svh" }}>
    <Navigation />

    {/* Hero — olive ground */}
    <section style={{ backgroundColor: "var(--olive)", padding: "9rem 2rem 6rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}>
          For Brands
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
          BEYOND THE
          <br />
          <span style={{ color: "var(--sky)" }}>VANITY METRICS.</span>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
            color: "var(--dark-brown)",
            opacity: 0.8,
            lineHeight: 1.7,
            maxWidth: 520,
            marginTop: "2rem",
          }}
        >
          Authentic creator partnerships engineered for measurable impact — from brand awareness to direct sales conversions.
        </p>
      </div>
    </section>

    {/* Why Eight-Six — lemon ground */}
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
            WHY EIGHT-SIX
          </h2>
          <p className="label" style={{ color: "var(--indigo)", opacity: 0.65 }}>
            Benefits
          </p>
        </div>

        {benefits.map((b, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "3rem 1fr 1.4fr",
              gap: "2rem",
              borderBottom: "1px solid rgba(66,30,24,0.14)",
              padding: "1.75rem 0",
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
              0{i + 1}
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
              {b.title}
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
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </section>

    {/* Approach — sky ground */}
    <section style={{ backgroundColor: "var(--sky)", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="label" style={{ color: "var(--indigo)", opacity: 0.7, marginBottom: "1.25rem" }}>
          Our approach
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2rem, 6vw, 5rem)",
            color: "var(--dark-brown)",
            lineHeight: 0.93,
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "3.5rem",
            maxWidth: "16ch",
          }}
        >
          A THREE-STEP PROCESS THAT ACTUALLY DELIVERS.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
          {steps.map((s) => (
            <div
              key={s.num}
              style={{
                borderTop: "2px solid var(--dark-brown)",
                paddingTop: "1.5rem",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.22em",
                  color: "var(--rust)",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                }}
              >
                Step {s.num}
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-display-cond)",
                  fontWeight: 500,
                  fontSize: "clamp(1.25rem, 2.2vw, 2rem)",
                  textTransform: "uppercase",
                  color: "var(--dark-brown)",
                  lineHeight: 1,
                  margin: 0,
                  marginBottom: "1rem",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9375rem",
                  color: "var(--dark-brown)",
                  opacity: 0.78,
                  lineHeight: 1.7,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Proof — dark brown */}
    <section style={{ backgroundColor: "var(--dark-brown)", padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="label" style={{ color: "var(--lemon)", opacity: 0.45, marginBottom: "1.25rem" }}>
          Our impact
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2rem, 6vw, 5rem)",
            color: "var(--lemon)",
            lineHeight: 0.93,
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "4rem",
          }}
        >
          REAL RESULTS. NO SPIN.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2.5rem" }}>
          {proof.map((p, i) => (
            <div key={i} style={{ borderTop: "1px solid rgba(243,255,183,0.25)", paddingTop: "1.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  color: "var(--lime)",
                  lineHeight: 1,
                  marginBottom: "1rem",
                }}
              >
                {p.stat}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--lemon)",
                  marginBottom: "0.5rem",
                }}
              >
                {p.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8125rem",
                  color: "var(--lemon)",
                  opacity: 0.6,
                }}
              >
                {p.context}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            color: "var(--lime)",
            transform: "rotate(-2deg)",
            display: "inline-block",
            marginTop: "3rem",
          }}
        >
          340% conversions. 2.8x ROAS. first 90 days.
        </p>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
);

export default ForBrands;
