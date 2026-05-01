import { useEffect } from "react";
// Font assets — imported so Vite emits hashed URLs and bundles them.
import canardWoff2 from "@/assets/fonts/TAN-StCanard-Regular.woff2";
import canardOtf from "@/assets/fonts/TAN-StCanard-Regular.otf";
import biroWoff from "@/assets/fonts/BiroScript-Reduced.ttf";
import biroOtf from "@/assets/fonts/BiroScript-Reduced.otf";
import placardBold from "@/assets/fonts/PlacardNext-Bold.ttf";
import placardCondBold from "@/assets/fonts/PlacardNext-CondBold.ttf";

/**
 * Temporary holding page for thenotagency.com.
 * Self-contained: no shared Navigation/Footer.
 * Color palette stored in mem://design/thenotagency-palette.
 *
 * Fonts (page-scoped via injected @font-face so the rest of the
 * Eight-Six site keeps its Playfair/Inter stack untouched):
 *   - TAN St. Canard — heavy condensed display
 *   - Biro Script Reduced — handwritten accent
 */
const NotAgency = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "The Not Agency";

    const style = document.createElement("style");
    style.setAttribute("data-notagency-fonts", "true");
    style.textContent = `
      @font-face {
        font-family: 'TAN St Canard';
        src: url('${canardWoff2}') format('woff2'),
             url('${canardOtf}') format('opentype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Biro Script';
        src: url('${biroOtf}') format('opentype'),
             url('${biroWoff}') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Placard Next';
        src: url('${placardBold}') format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Placard Next Cond';
        src: url('${placardCondBold}') format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.title = prevTitle;
      document.head.removeChild(style);
    };
  }, []);

  // Brand palette
  const OLIVE = "#838E00";
  const PALE_BLUE = "#CAD7EB";
  const DEEP_BROWN = "#421E18";
  const WARM_BROWN = "#523838";

  const displayFont = `'TAN St Canard', 'Arial Narrow', Impact, sans-serif`;
  const placardFont = `'Placard Next Cond', 'Arial Narrow', Impact, sans-serif`;
  const handFont = `'Biro Script', 'Bradley Hand', cursive`;

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: OLIVE, color: DEEP_BROWN }}
    >
      <section className="flex-1 flex items-center px-6 sm:px-12 md:px-20 py-16">
        <div className="w-full max-w-6xl mx-auto">
          <div className="relative">
            <div className="flex items-start gap-4 sm:gap-6 mb-2 sm:mb-4">
              <h1
                style={{
                  fontFamily: displayFont,
                  color: PALE_BLUE,
                  fontSize: "clamp(4.5rem, 14vw, 11rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                NOT.
              </h1>
              <div
                aria-hidden
                className="hidden sm:flex flex-col items-start pt-4 md:pt-6"
                style={{ color: PALE_BLUE }}
              >
                <span
                  style={{
                    fontFamily: handFont,
                    fontSize: "clamp(1.1rem, 2vw, 1.75rem)",
                    transform: "rotate(-4deg)",
                    whiteSpace: "nowrap",
                    transformOrigin: "left center",
                    marginLeft: "0.5rem",
                  }}
                >
                  your typical partnerships
                </span>
                {/* Hand-drawn curved arrow pointing down-left toward "NOT." */}
                <svg
                  width="140"
                  height="90"
                  viewBox="0 0 140 90"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginTop: "-0.5rem", marginLeft: "-1rem", overflow: "visible" }}
                >
                  {/* Curl: starts under the text on the right, sweeps down-left toward NOT. */}
                  <path
                    d="M132 6 C 110 22, 80 38, 32 70"
                    stroke={PALE_BLUE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Arrowhead at the tip — two short strokes forming a V pointing down-left */}
                  <path
                    d="M32 70 L 48 64"
                    stroke={PALE_BLUE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M32 70 L 40 82"
                    stroke={PALE_BLUE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile: text + small inline arrow */}
            <div
              aria-hidden
              className="sm:hidden mb-4 flex items-center gap-2"
              style={{ color: PALE_BLUE }}
            >
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <path
                  d="M28 3 C 20 8, 12 12, 6 16"
                  stroke={PALE_BLUE}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M6 16 L 12 14 M6 16 L 9 20"
                  stroke={PALE_BLUE}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span
                style={{
                  fontFamily: handFont,
                  fontSize: "1.4rem",
                  transform: "rotate(-2deg)",
                }}
              >
                your typical partnerships
              </span>
            </div>

            <h2
              style={{
                fontFamily: placardFont,
                fontWeight: 700,
                color: DEEP_BROWN,
                fontSize: "clamp(3.5rem, 12vw, 9.5rem)",
                lineHeight: 1.05,
                letterSpacing: "0",
                margin: 0,
              }}
            >
              JUST
              <br />
              ANOTHER
              <br />
              TALENT AGENCY
            </h2>
          </div>

          <div className="mt-12 sm:mt-16">
            <a
              href="mailto:lawrence@eight6media.com"
              className="inline-block transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: displayFont,
                letterSpacing: "0.08em",
                fontSize: "1.05rem",
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

      <footer
        className="px-6 sm:px-12 md:px-20 py-6 flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center justify-between"
        style={{ color: WARM_BROWN, fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}
      >
        <span style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          © {new Date().getFullYear()} The Not Agency
        </span>
      </footer>
    </main>
  );
};

export default NotAgency;
