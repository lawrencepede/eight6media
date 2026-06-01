import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.transform = `translateY(${y * 0.18}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        backgroundColor: "var(--olive)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "5rem 2rem 4rem",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "3rem",
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: "var(--dark-brown)",
          opacity: 0.18,
        }}
      />

      <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%", paddingTop: "4rem" }}>
        <p
          className="label fade-up"
          style={{ color: "var(--dark-brown)", opacity: 0.6, marginBottom: "1.25rem" }}
        >
          Talent &amp; Media Agency
        </p>

        <div ref={heroRef} style={{ position: "relative", display: "inline-block" }}>
          <h1
            className="fade-up fade-up-delay-1"
            style={{
              fontFamily: "var(--font-wordmark)",
              fontSize: "clamp(3.5rem, 11vw, 8rem)",
              color: "var(--sky)",
              lineHeight: 0.93,
              letterSpacing: "-0.01em",
              marginBottom: "0.05em",
            }}
          >
            NOT.
          </h1>

          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-0.5em",
              left: "clamp(9rem, 28vw, 22rem)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <svg
              viewBox="0 0 120 80"
              style={{
                width: "clamp(5rem, 9vw, 8.5rem)",
                overflow: "visible",
                position: "absolute",
                top: "1.6em",
                left: "-1.2em",
              }}
              fill="none"
            >
              <path d="M10 70 C 20 30, 60 10, 110 15" stroke="var(--lemon)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M104 8 L110 15 L101 18" stroke="var(--lemon)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>

            <span
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "clamp(0.9rem, 2.2vw, 1.6rem)",
                color: "var(--lemon)",
                display: "block",
                transform: "rotate(-8deg)",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}
            >
              your typical
              <br />
              partnerships
            </span>
          </div>

          <h2
            className="fade-up fade-up-delay-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(3.8rem, 14vw, 11.5rem)",
              color: "var(--dark-brown)",
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            ANOTHER
            <br />
            TALENT AGENCY
          </h2>
        </div>

        <p
          className="fade-up fade-up-delay-3"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.875rem, 1.4vw, 1.05rem)",
            color: "var(--dark-brown)",
            opacity: 0.75,
            lineHeight: 1.7,
            maxWidth: 440,
            marginTop: "1.75rem",
          }}
        >
          Authentic creator partnerships that deliver genuine value
          and measurable results — for brands that actually care.
        </p>

        <div
          className="fade-up fade-up-delay-4"
          style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}
        >
          <a
            href="mailto:elizabeth@eight6media.com"
            style={{
              display: "inline-block",
              backgroundColor: "var(--mauve)",
              color: "var(--olive)",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              padding: "1rem 2rem",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s, color 0.2s",
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.06) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.06) 75%, transparent 75%)",
              backgroundSize: "4px 4px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = "var(--indigo)";
              el.style.color = "var(--lemon)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = "var(--mauve)";
              el.style.color = "var(--olive)";
            }}
          >
            GET IN TOUCH →
          </a>

          <Link
            to="/v2/roster"
            style={{
              display: "inline-block",
              backgroundColor: "transparent",
              color: "var(--dark-brown)",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              padding: "1rem 2rem",
              border: "1px solid var(--dark-brown)",
              cursor: "pointer",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = "var(--dark-brown)";
              el.style.color = "var(--lemon)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = "transparent";
              el.style.color = "var(--dark-brown)";
            }}
          >
            VIEW TALENT →
          </Link>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          opacity: 0.5,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.5625rem",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "var(--dark-brown)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 36,
            backgroundColor: "var(--dark-brown)",
            animation: "scrollPulse 1.8s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes scrollPulse {
            0%, 100% { opacity: 0.4; transform: scaleY(0.6); transform-origin: top; }
            50% { opacity: 1; transform: scaleY(1); transform-origin: top; }
          }
        `}</style>
      </div>
    </section>
  );
};

export default HeroSection;
