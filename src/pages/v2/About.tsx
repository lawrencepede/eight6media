import Navigation from "@/components/v2/Navigation";
import Footer from "@/components/v2/Footer";
import CTASection from "@/components/v2/CTASection";
import elizabethPhoto from "@/assets/elizabeth-photo.png";

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div style={{ borderTop: "1px solid rgba(66,30,24,0.2)", paddingTop: "1.25rem" }}>
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 500,
        fontSize: "clamp(2.5rem, 5vw, 4rem)",
        color: "var(--dark-brown)",
        lineHeight: 1,
      }}
    >
      {value}
    </div>
    <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginTop: "0.75rem" }}>
      {label}
    </p>
  </div>
);

const About = () => (
  <div className="v2-root" style={{ minHeight: "100svh" }}>
    <Navigation />

    {/* Hero — peach ground */}
    <section
      style={{
        backgroundColor: "var(--peach)",
        padding: "9rem 2rem 6rem",
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}>
          About
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
          NOT THE ALGORITHM.
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
          created by the passionate.
        </p>
      </div>
    </section>

    {/* Founder — mauve ground */}
    <section style={{ backgroundColor: "var(--mauve)", padding: "6rem 2rem" }}>
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        <div>
          <img
            src={elizabethPhoto}
            alt="Elizabeth Martin, Founder"
            style={{
              width: "100%",
              aspectRatio: "4 / 5",
              objectFit: "cover",
              border: "1px solid rgba(66,30,24,0.2)",
              filter: "saturate(0.9) contrast(1.05)",
            }}
          />
          <p
            className="label"
            style={{ color: "var(--dark-brown)", opacity: 0.65, marginTop: "1rem" }}
          >
            Elizabeth Martin · Founder
          </p>
        </div>

        <div>
          <p className="label" style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}>
            Meet the founder
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(2rem, 5vw, 4.25rem)",
              color: "var(--dark-brown)",
              lineHeight: 0.95,
              textTransform: "uppercase",
              margin: 0,
              marginBottom: "2rem",
            }}
          >
            BUILT BY SOMEONE
            <br />
            WHO'S BEEN
            <br />
            ON BOTH SIDES.
          </h2>
          {[
            "Founded in 2023, Eight-Six Media has grown solely through word of mouth by creating value for creators and their audiences while delivering measurable results for brand partners.",
            "We believe authenticity is the single most important factor for conversions and long-term audience loyalty.",
            "Our team has grown from one to six in the past 12 months — a killer talent & brand manager team plus a COO/CFO taking Eight-Six to the next level and beyond.",
          ].map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.875rem, 1.3vw, 1.05rem)",
                color: "var(--dark-brown)",
                opacity: 0.8,
                lineHeight: 1.75,
                marginBottom: "1.25rem",
              }}
            >
              {p}
            </p>
          ))}
          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "clamp(1.1rem, 1.8vw, 1.4rem)",
              color: "var(--indigo)",
              transform: "rotate(-2deg)",
              display: "inline-block",
              marginTop: "1rem",
            }}
          >
            no middlemen. no BS.
          </p>
        </div>
      </div>
    </section>

    {/* Why Eight-Six — dark brown ground */}
    <section style={{ backgroundColor: "var(--dark-brown)", padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <p className="label" style={{ color: "var(--lemon)", opacity: 0.45, marginBottom: "1.5rem" }}>
          Why "Eight-Six"?
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            color: "var(--lemon)",
            lineHeight: 1,
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "2rem",
          }}
        >
          7 SECONDS TO CAPTURE ATTENTION.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            color: "var(--lemon)",
            opacity: 0.75,
            lineHeight: 1.7,
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          That's roughly{" "}
          <span
            style={{
              fontFamily: "var(--font-wordmark)",
              fontSize: "1.5em",
              color: "var(--lime)",
              opacity: 1,
            }}
          >
            8.6 heartbeats
          </span>{" "}
          — the window we have to make a lasting impression. We help brands make every one of them count.
        </p>
      </div>
    </section>

    {/* Mission + stats — lemon ground */}
    <section style={{ backgroundColor: "var(--lemon)", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "start",
            borderBottom: "1px solid rgba(66,30,24,0.2)",
            paddingBottom: "4rem",
            marginBottom: "4rem",
          }}
        >
          <p className="label" style={{ color: "var(--indigo)", opacity: 0.7 }}>
            Our mission
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: "var(--dark-brown)",
              lineHeight: 1.15,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Leave an impression on as many human lives as possible — through partnerships that deliver genuine value for audiences and bottom-line impact for brands.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2.5rem",
          }}
        >
          <Stat value="2023" label="Founded" />
          <Stat value="100%" label="Word-of-mouth growth" />
          <Stat value="6" label="Team members" />
        </div>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
);

export default About;
