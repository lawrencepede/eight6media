import { useEffect, useRef, useState, useCallback } from "react";
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
 *
 * Edit mode: append `?edit=1` to the URL to drag, rotate, and resize
 * the hand-drawn arrow. Values are saved to localStorage so they
 * persist across reloads. Once you're happy, copy the values shown
 * in the on-screen badge and bake them into DEFAULT_ARROW below.
 */

type ArrowState = {
  // Position is a percentage of the hero container so it stays roughly
  // in place across viewport sizes.
  xPct: number;
  yPct: number;
  width: number; // px
  rotation: number; // degrees
};

const STORAGE_KEY = "notagency.arrow.v1";

const DEFAULT_ARROW: ArrowState = {
  xPct: 38,
  yPct: 18,
  width: 200,
  rotation: 0,
};

const NotAgency = () => {
  const [arrow, setArrow] = useState<ArrowState>(() => {
    if (typeof window === "undefined") return DEFAULT_ARROW;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_ARROW, ...JSON.parse(saved) };
    } catch {
      /* ignore */
    }
    return DEFAULT_ARROW;
  });

  const editMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("edit") === "1";

  const heroRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    mode: "move" | "rotate" | "resize" | null;
    startX: number;
    startY: number;
    startState: ArrowState;
    centerX: number;
    centerY: number;
    heroRect: DOMRect;
  }>({
    mode: null,
    startX: 0,
    startY: 0,
    startState: DEFAULT_ARROW,
    centerX: 0,
    centerY: 0,
    heroRect: new DOMRect(),
  });

  // Persist arrow values
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(arrow));
    } catch {
      /* ignore */
    }
  }, [arrow]);

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
        font-weight: 400; font-style: normal; font-display: swap;
      }
      @font-face {
        font-family: 'Biro Script';
        src: url('${biroOtf}') format('opentype'),
             url('${biroWoff}') format('truetype');
        font-weight: 400; font-style: normal; font-display: swap;
      }
      @font-face {
        font-family: 'Placard Next';
        src: url('${placardBold}') format('truetype');
        font-weight: 700; font-style: normal; font-display: swap;
      }
      @font-face {
        font-family: 'Placard Next Cond';
        src: url('${placardCondBold}') format('truetype');
        font-weight: 700; font-style: normal; font-display: swap;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.title = prevTitle;
      document.head.removeChild(style);
    };
  }, []);

  // Pointer handlers shared across move/rotate/resize.
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d.mode) return;
    e.preventDefault();

    if (d.mode === "move") {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const newXPct =
        d.startState.xPct + (dx / d.heroRect.width) * 100;
      const newYPct =
        d.startState.yPct + (dy / d.heroRect.height) * 100;
      setArrow((s) => ({ ...s, xPct: newXPct, yPct: newYPct }));
    } else if (d.mode === "rotate") {
      const angle =
        (Math.atan2(e.clientY - d.centerY, e.clientX - d.centerX) * 180) /
        Math.PI;
      // Offset by 90° so dragging straight down feels like 0°.
      setArrow((s) => ({ ...s, rotation: Math.round(angle + 90) }));
    } else if (d.mode === "resize") {
      const dist = Math.hypot(e.clientX - d.centerX, e.clientY - d.centerY);
      // Treat distance from center as half-width.
      const newWidth = Math.max(60, Math.min(800, Math.round(dist * 2)));
      setArrow((s) => ({ ...s, width: newWidth }));
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.mode = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = (
    mode: "move" | "rotate" | "resize",
    e: React.PointerEvent
  ) => {
    if (!editMode || !heroRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const heroRect = heroRef.current.getBoundingClientRect();
    const centerX = heroRect.left + (arrow.xPct / 100) * heroRect.width;
    const centerY = heroRect.top + (arrow.yPct / 100) * heroRect.height;
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startState: { ...arrow },
      centerX,
      centerY,
      heroRect,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Brand palette
  const OLIVE = "#838E00";
  const PALE_BLUE = "#CAD7EB";
  const ARROW_GREEN = "#ddf48c";
  const DEEP_BROWN = "#421E18";
  const WARM_BROWN = "#523838";

  const displayFont = `'TAN St Canard', 'Arial Narrow', Impact, sans-serif`;
  const placardFont = `'Placard Next Cond', 'Arial Narrow', Impact, sans-serif`;
  const handFont = `'Biro Script', 'Bradley Hand', cursive`;

  const arrowAspect = 1920 / 1080; // approximate from source PNG

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: OLIVE, color: DEEP_BROWN }}
    >
      <section className="flex-1 flex items-center px-6 sm:px-12 md:px-20 py-16">
        <div ref={heroRef} className="w-full max-w-6xl mx-auto relative">
          {/* Headlines */}
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
              </div>
            </div>

            {/* Mobile handwritten line (no arrow on mobile, kept simple) */}
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

          {/* Free-floating arrow — draggable in edit mode */}
          <div
            onPointerDown={(e) => startDrag("move", e)}
            style={{
              position: "absolute",
              left: `${arrow.xPct}%`,
              top: `${arrow.yPct}%`,
              width: arrow.width,
              height: arrow.width / arrowAspect,
              transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg)`,
              touchAction: "none",
              cursor: editMode ? "move" : "default",
              userSelect: "none",
              zIndex: 5,
            }}
          >
            {/* Tint the arrow PNG to exactly match ARROW_GREEN by using
                it as a CSS mask over a solid color block. */}
            <div
              aria-hidden
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: ARROW_GREEN,
                WebkitMaskImage: `url(${arrowImg})`,
                maskImage: `url(${arrowImg})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                pointerEvents: "none",
              }}
            />
            {editMode && (
              <>
                {/* Selection outline */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: `1px dashed ${DEEP_BROWN}`,
                    pointerEvents: "none",
                  }}
                />
                {/* Rotate handle (top) */}
                <div
                  onPointerDown={(e) => startDrag("rotate", e)}
                  title="Drag to rotate"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -28,
                    transform: "translateX(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: DEEP_BROWN,
                    border: `2px solid ${ARROW_GREEN}`,
                    cursor: "grab",
                    touchAction: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -20,
                    width: 1,
                    height: 20,
                    background: DEEP_BROWN,
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                />
                {/* Resize handle (bottom-right) */}
                <div
                  onPointerDown={(e) => startDrag("resize", e)}
                  title="Drag to resize"
                  style={{
                    position: "absolute",
                    right: -8,
                    bottom: -8,
                    width: 14,
                    height: 14,
                    background: ARROW_GREEN,
                    border: `2px solid ${DEEP_BROWN}`,
                    cursor: "nwse-resize",
                    touchAction: "none",
                  }}
                />
              </>
            )}
          </div>

          {/* Edit mode HUD */}
          {editMode && (
            <div
              style={{
                position: "fixed",
                bottom: 16,
                right: 16,
                background: DEEP_BROWN,
                color: ARROW_GREEN,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                padding: "10px 12px",
                borderRadius: 6,
                zIndex: 50,
                lineHeight: 1.5,
                boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
                maxWidth: 280,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Arrow edit mode
              </div>
              <div>x: {arrow.xPct.toFixed(1)}%</div>
              <div>y: {arrow.yPct.toFixed(1)}%</div>
              <div>width: {arrow.width}px</div>
              <div>rotation: {arrow.rotation}°</div>
              <button
                onClick={() => setArrow(DEFAULT_ARROW)}
                style={{
                  marginTop: 8,
                  background: ARROW_GREEN,
                  color: DEEP_BROWN,
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Reset
              </button>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                Drag arrow to move · top dot to rotate · corner to resize
              </div>
            </div>
          )}

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
