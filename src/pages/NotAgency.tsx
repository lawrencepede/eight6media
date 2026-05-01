import { useEffect } from "react";

/**
 * Temporary holding page for thenotagency.com.
 * Self-contained: no shared Navigation/Footer.
 * Color palette stored in mem://design/thenotagency-palette
 *
 * Fonts: Anton (heavy condensed display) + Caveat (handwritten) loaded
 * from Google Fonts as placeholders until the real Canva fonts are
 * uploaded into src/assets/fonts/.
 */
const NotAgency = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "The Not Agency";

    // Inject Google Fonts only when this page is mounted, so the rest
    // of the Eight-Six site keeps its Playfair/Inter stack untouched.
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@500;700&display=swap";

    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(fontLink);

    return () => {
      document.title = prevTitle;
      document.head.removeChild(preconnect1);
      document.head.removeChild(preconnect2);
      document.head.removeChild(fontLink);
    };
  }, []);

  // Brand palette (kept inline rather than added to global tokens so
  // it cannot leak into Eight-Six components).
  const OLIVE = "#838E00";
  const PALE_BLUE = "#CAD7EB";
  const DEEP_BROWN = "#421E18";
  const WARM_BROWN = "#523838";

  const displayFont = `'Anton', 'Arial Narrow', Impact, sans-serif`;
  const handFont = `'Caveat', 'Bradley Hand', cursive`;

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: OLIVE, color: DEEP_BROWN }}
    >
      {/* Hero */}
      <section className="flex-1 flex items-center px-6 sm:px-12 md:px-20 py-16">
        <div className="w-full max-w-6xl mx-auto">
          <div className="relative">
            {/* NOT. with handwritten note */}
            <div className="flex items-start gap-4 sm:gap-6 mb-2 sm:mb-4">
              <h1
                style={{
                  fontFamily: displayFont,
                  color: PALE_BLUE,
                  fontSize: "clamp(4.5rem, 14vw, 11rem)",
                  lineHeight: 0.85,
                  letterSpacing: "-0.02em",
                }}
              >
                NOT.
              </h1>
              <span
                aria-hidden
                className="hidden sm:inline-block pt-4 md:pt-6"
                style={{
                  fontFamily: handFont,
                  color: PALE_BLUE,
                  fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
                  transform: "rotate(-4deg)",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ marginRight: "0.4em" }}>⌐</span>
                your typical partnerships
              </span>
            </div>

            {/* Mobile-only handwritten line */}
            <div
              aria-hidden
              className="sm:hidden mb-4"
              style={{
                fontFamily: handFont,
                color: PALE_BLUE,
                fontSize: "1.25rem",
                transform: "rotate(-2deg)",
              }}
            >
              ⌐ your typical partnerships
            </div>

            <h2
              style={{
                fontFamily: displayFont,
                color: DEEP_BROWN,
                fontSize: "clamp(3.5rem, 12vw, 9.5rem)",
                lineHeight: 0.88,
                letterSpacing: "-0.01em",
              }}
            >
              ANOTHER
              <br />
              TALENT AGENCY
            </h2>
          </div>

          {/* CTA */}
          <div className="mt-12 sm:mt-16">
            <a
              href="mailto:lawrence@eight6media.com"
              className="inline-block transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: displayFont,
                letterSpacing: "0.08em",
                fontSize: "0.95rem",
                color: OLIVE,
                backgroundColor: DEEP_BROWN,
                padding: "1rem 2rem",
                textDecoration: "none",
              }}
            >
              GET IN TOUCH →
            </a>
          </div>
        </div>
      </section>

      {/* Footer line */}
      <footer
        className="px-6 sm:px-12 md:px-20 py-6 flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center justify-between"
        style={{ color: WARM_BROWN, fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}
      >
        <span style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          © {new Date().getFullYear()} The Not Agency
        </span>
        <a
          href="mailto:lawrence@eight6media.com"
          style={{ color: WARM_BROWN, letterSpacing: "0.05em" }}
          className="hover:opacity-70 transition-opacity"
        >
          lawrence@eight6media.com
        </a>
      </footer>
    </main>
  );
};

export default NotAgency;
