import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type ScribbleConfig = {
  offsetX: number;   // px, horizontal nudge of whole group
  offsetY: number;   // px, vertical nudge of whole group
  scale: number;     // overall scale multiplier
  textRotate: number;     // deg, rotation of handwritten text
  textOffsetX: number;    // px, nudge text relative to arrow
  textOffsetY: number;    // px
  arrowRotate: number;    // deg, rotation of arrow
  arrowOffsetX: number;   // px
  arrowOffsetY: number;   // px
};

const DEFAULTS: ScribbleConfig = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  textRotate: -8,
  textOffsetX: 0,
  textOffsetY: 0,
  arrowRotate: 0,
  arrowOffsetX: 0,
  arrowOffsetY: 0,
};

const STORAGE_KEY = "v2-hero-scribble-v1";

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [cfg, setCfg] = useState<ScribbleConfig>(DEFAULTS);
  const [panelOpen, setPanelOpen] = useState(false);

  // Load saved config
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCfg({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch {}
  }, [cfg]);

  // Toggle panel with `Shift + P`
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "P" || e.key === "p")) {
        setPanelOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.transform = `translateY(${y * 0.18}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const update = (patch: Partial<ScribbleConfig>) =>
    setCfg((prev) => ({ ...prev, ...patch }));

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
            className="fade-up fade-up-delay-5"
            style={{
              position: "absolute",
              top: "-0.5em",
              left: "clamp(9rem, 28vw, 22rem)",
              pointerEvents: "none",
              userSelect: "none",
              transform: `translate(${cfg.offsetX}px, ${cfg.offsetY}px) scale(${cfg.scale})`,
              transformOrigin: "top left",
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
                transform: `translate(${cfg.arrowOffsetX}px, ${cfg.arrowOffsetY}px) rotate(${cfg.arrowRotate}deg)`,
                transformOrigin: "center",
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
                transform: `translate(${cfg.textOffsetX}px, ${cfg.textOffsetY}px) rotate(${cfg.textRotate}deg)`,
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

      {/* Dev positioning panel — toggle with the small button (bottom-right) or Shift+P */}
      <button
        onClick={() => setPanelOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          padding: "0.5rem 0.75rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.625rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          backgroundColor: "var(--dark-brown)",
          color: "var(--lemon)",
          border: "1px solid var(--lemon)",
          cursor: "pointer",
          opacity: 0.85,
        }}
        aria-label="Toggle scribble position panel"
      >
        {panelOpen ? "Close" : "Adjust scribble"}
      </button>

      {panelOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            right: 16,
            zIndex: 9999,
            width: 280,
            padding: "1rem 1rem 0.75rem",
            backgroundColor: "var(--dark-brown)",
            color: "var(--lemon)",
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            border: "1px solid var(--lemon)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div style={{ marginBottom: "0.5rem", letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.7 }}>
            Scribble position
          </div>

          {([
            ["Group X", "offsetX", -400, 400, 1],
            ["Group Y", "offsetY", -400, 400, 1],
            ["Scale", "scale", 0.3, 2.5, 0.01],
            ["Arrow X", "arrowOffsetX", -200, 200, 1],
            ["Arrow Y", "arrowOffsetY", -200, 200, 1],
            ["Arrow rotate", "arrowRotate", -180, 180, 1],
            ["Text X", "textOffsetX", -200, 200, 1],
            ["Text Y", "textOffsetY", -200, 200, 1],
            ["Text rotate", "textRotate", -45, 45, 1],
          ] as const).map(([label, key, min, max, step]) => (
            <div key={key} style={{ marginBottom: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span>{label}</span>
                <span style={{ opacity: 0.7 }}>{cfg[key]}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={cfg[key]}
                onChange={(e) => update({ [key]: parseFloat(e.target.value) } as Partial<ScribbleConfig>)}
                style={{ width: "100%", accentColor: "var(--lemon)" }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button
              onClick={() => setCfg(DEFAULTS)}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: "transparent",
                color: "var(--lemon)",
                border: "1px solid var(--lemon)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.625rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Reset
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(JSON.stringify(cfg, null, 2));
              }}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: "var(--lemon)",
                color: "var(--dark-brown)",
                border: "1px solid var(--lemon)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.625rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
              }}
            >
              Copy values
            </button>
          </div>
          <div style={{ marginTop: "0.5rem", opacity: 0.55, fontSize: "0.6rem" }}>
            Saved locally. Toggle with Shift + P.
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
