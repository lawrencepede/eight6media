import { useEffect } from "react";
// Font assets — imported so Vite emits hashed URLs and bundles them.
import canardWoff2 from "@/assets/fonts/TAN-StCanard-Regular.woff2";
import canardOtf from "@/assets/fonts/TAN-StCanard-Regular.otf";
import biroWoff from "@/assets/fonts/BiroScript-Reduced.ttf";
import biroOtf from "@/assets/fonts/BiroScript-Reduced.otf";
import placardBold from "@/assets/fonts/PlacardNext-Bold.ttf";
import placardCondBold from "@/assets/fonts/PlacardNext-CondBold.ttf";
import arrowImg from "@/assets/notagency-arrow.png";

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
  const ARROW_GREEN = "#ddf48c";
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
              >
                <span
                  style={{
                    fontFamily: handFont,
                    fontSize: "clamp(1.1rem, 2vw, 1.75rem)",
                    transform: "rotate(-4deg)",
                    whiteSpace: "nowrap",
                    transformOrigin: "left center",
                    marginLeft: "0.5rem",
                    color: ARROW_GREEN,
                  }}
                >
                  your typical partnerships
                </span>
                <img
                  src={arrowImg}
                  alt=""
                  style={{
                    width: "clamp(140px, 16vw, 220px)",
                    height: "auto",
                    marginTop: "0.25rem",
                    marginLeft: "-0.5rem",
                    display: "block",
                  }}
                />
              </div>
            </div>

            {/* Mobile: text + small inline arrow */}
            <div
              aria-hidden
              className="sm:hidden mb-4 flex flex-col items-start gap-1"
            >
              <span
                style={{
                  fontFamily: handFont,
                  fontSize: "1.4rem",
                  transform: "rotate(-2deg)",
                  color: ARROW_GREEN,
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
