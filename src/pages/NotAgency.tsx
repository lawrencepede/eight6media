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
 *
 * Edit mode: append `?edit=1` to the URL to drag, rotate, and resize
 * the arrow AND the handwritten text. Values persist in localStorage.
 * Once happy, copy the values from the on-screen HUD and bake them
 * into DEFAULT_LAYOUT below.
 */

type Item = {
  xPct: number; // center x as % of hero
  yPct: number; // center y as % of hero
  size: number; // px — width for arrow, font-size for text
  rotation: number; // degrees
};

type Layout = {
  arrow: Item;
  text: Item;
};

const STORAGE_KEY = "notagency.layout.v2";

const DEFAULT_LAYOUT: Layout = {
  arrow: { xPct: 38, yPct: 18, size: 200, rotation: 0 },
  text: { xPct: 50, yPct: 8, size: 28, rotation: -4 },
};

type ItemKey = keyof Layout;
type DragMode = "move" | "rotate" | "resize";

const NotAgency = () => {
  const [layout, setLayout] = useState<Layout>(() => {
    if (typeof window === "undefined") return DEFAULT_LAYOUT;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          arrow: { ...DEFAULT_LAYOUT.arrow, ...(parsed.arrow ?? {}) },
          text: { ...DEFAULT_LAYOUT.text, ...(parsed.text ?? {}) },
        };
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_LAYOUT;
  });

  const editMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("edit") === "1";

  const heroRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    target: ItemKey | null;
    mode: DragMode | null;
    startX: number;
    startY: number;
    startState: Item;
    centerX: number;
    centerY: number;
    heroRect: DOMRect;
  }>({
    target: null,
    mode: null,
    startX: 0,
    startY: 0,
    startState: DEFAULT_LAYOUT.arrow,
    centerX: 0,
    centerY: 0,
    heroRect: new DOMRect(),
  });

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      /* ignore */
    }
  }, [layout]);

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

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d.mode || !d.target) return;
    e.preventDefault();
    const target = d.target;

    if (d.mode === "move") {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const newXPct =
        d.startState.xPct + (dx / d.heroRect.width) * 100;
      const newYPct =
        d.startState.yPct + (dy / d.heroRect.height) * 100;
      setLayout((s) => ({
        ...s,
        [target]: { ...s[target], xPct: newXPct, yPct: newYPct },
      }));
    } else if (d.mode === "rotate") {
      const angle =
        (Math.atan2(e.clientY - d.centerY, e.clientX - d.centerX) * 180) /
        Math.PI;
      setLayout((s) => ({
        ...s,
        [target]: { ...s[target], rotation: Math.round(angle + 90) },
      }));
    } else if (d.mode === "resize") {
      const dist = Math.hypot(e.clientX - d.centerX, e.clientY - d.centerY);
      // Arrow: distance ≈ half-width. Text: scale relative to start.
      if (target === "arrow") {
        const newSize = Math.max(60, Math.min(800, Math.round(dist * 2)));
        setLayout((s) => ({ ...s, arrow: { ...s.arrow, size: newSize } }));
      } else {
        // For text, use distance ratio against original click distance.
        const startDist = Math.hypot(
          d.startX - d.centerX,
          d.startY - d.centerY
        );
        const ratio = startDist > 0 ? dist / startDist : 1;
        const newSize = Math.max(
          10,
          Math.min(120, Math.round(d.startState.size * ratio))
        );
        setLayout((s) => ({ ...s, text: { ...s.text, size: newSize } }));
      }
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.mode = null;
    dragRef.current.target = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = (
    target: ItemKey,
    mode: DragMode,
    e: React.PointerEvent
  ) => {
    if (!editMode || !heroRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const heroRect = heroRef.current.getBoundingClientRect();
    const item = layout[target];
    const centerX = heroRect.left + (item.xPct / 100) * heroRect.width;
    const centerY = heroRect.top + (item.yPct / 100) * heroRect.height;
    dragRef.current = {
      target,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startState: { ...item },
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

  const arrowAspect = 1920 / 1080;

  // Reusable selection chrome (outline + rotate handle + resize handle)
  const SelectionChrome = ({ target }: { target: ItemKey }) => (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `1px dashed ${DEEP_BROWN}`,
          pointerEvents: "none",
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
      <div
        onPointerDown={(e) => startDrag(target, "rotate", e)}
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
        onPointerDown={(e) => startDrag(target, "resize", e)}
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
  );

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

          {/* Free-floating handwritten text */}
          <div
            onPointerDown={(e) => startDrag("text", "move", e)}
            style={{
              position: "absolute",
              left: `${layout.text.xPct}%`,
              top: `${layout.text.yPct}%`,
              transform: `translate(-50%, -50%) rotate(${layout.text.rotation}deg)`,
              touchAction: "none",
              cursor: editMode ? "move" : "default",
              userSelect: "none",
              zIndex: 6,
              padding: "4px 6px",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily: handFont,
                fontSize: layout.text.size,
                color: ARROW_GREEN,
                lineHeight: 1,
                display: "inline-block",
                pointerEvents: "none",
              }}
            >
              your typical partnerships
            </span>
            {editMode && <SelectionChrome target="text" />}
          </div>

          {/* Free-floating arrow */}
          <div
            onPointerDown={(e) => startDrag("arrow", "move", e)}
            style={{
              position: "absolute",
              left: `${layout.arrow.xPct}%`,
              top: `${layout.arrow.yPct}%`,
              width: layout.arrow.size,
              height: layout.arrow.size / arrowAspect,
              transform: `translate(-50%, -50%) rotate(${layout.arrow.rotation}deg)`,
              touchAction: "none",
              cursor: editMode ? "move" : "default",
              userSelect: "none",
              zIndex: 5,
            }}
          >
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
            {editMode && <SelectionChrome target="arrow" />}
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
                maxWidth: 320,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Edit mode</div>
              <div style={{ marginTop: 4, fontWeight: 700 }}>Arrow</div>
              <div>x: {layout.arrow.xPct.toFixed(1)}%  y: {layout.arrow.yPct.toFixed(1)}%</div>
              <div>width: {layout.arrow.size}px  rot: {layout.arrow.rotation}°</div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Text</div>
              <div>x: {layout.text.xPct.toFixed(1)}%  y: {layout.text.yPct.toFixed(1)}%</div>
              <div>size: {layout.text.size}px  rot: {layout.text.rotation}°</div>
              <button
                onClick={() => setLayout(DEFAULT_LAYOUT)}
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
                Reset both
              </button>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                Drag to move · top dot = rotate · corner = resize
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
