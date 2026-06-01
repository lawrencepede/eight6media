import { Link } from "react-router-dom";

const AboutPreview = () => (
  <section
    style={{
      backgroundColor: "var(--mauve)",
      padding: "6rem 2rem",
      position: "relative",
    }}
  >
    <div
      style={{
        maxWidth: 1300,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <div>
          <p
            className="label"
            style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.5rem" }}
          >
            Meet the founder
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(2.25rem, 6vw, 5.5rem)",
              textTransform: "uppercase",
              color: "var(--dark-brown)",
              lineHeight: 0.93,
              marginBottom: "2rem",
              margin: 0,
            }}
          >
            BUILT BY SOMEONE
            <br />
            WHO'S BEEN
            <br />
            ON BOTH SIDES.
          </h2>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.875rem, 1.3vw, 1.05rem)",
              color: "var(--dark-brown)",
              opacity: 0.8,
              lineHeight: 1.7,
              maxWidth: 520,
              marginTop: "2rem",
              marginBottom: "2.5rem",
            }}
          >
            Elizabeth Martin built Eight-Six Media after managing creator
            marketing in-house and recognising what was missing — authenticity,
            measurable results, and long-term vision. She's worked with brands.
            She's managed creators. She knows the gap between them. And she
            built something to close it.
          </p>

          <p
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
              color: "var(--indigo)",
              transform: "rotate(-2.5deg)",
              display: "inline-block",
              marginBottom: "2.5rem",
            }}
          >
            no middlemen. no BS.
          </p>

          <br />

          <Link
            to="/v2/about"
            style={{
              display: "inline-block",
              backgroundColor: "var(--dark-brown)",
              color: "var(--lemon)",
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              padding: "0.875rem 1.75rem",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--indigo)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--dark-brown)";
            }}
          >
            Our Story →
          </Link>
        </div>

        <div
          aria-hidden
          style={{
            fontFamily: "var(--font-wordmark)",
            fontSize: "clamp(6rem, 15vw, 14rem)",
            color: "var(--dark-brown)",
            opacity: 0.1,
            lineHeight: 1,
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          86
        </div>
      </div>
    </div>
  </section>
);

export default AboutPreview;
