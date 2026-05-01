import { useEffect, useRef, useState, useCallback } from "react";
// Fonts are declared in src/index.css and preloaded in index.html so they
// load with the initial CSS pass — no JS-mounted FOUT.
import arrowImg from "@/assets/notagency-arrow.png";
import envelopeImg from "@/assets/notagency-envelope.png";

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
  sizeEm: number; // size relative to the headline font-size (em)
  rotation: number; // degrees
};

type Layout = {
  arrow: Item;
  text: Item;
};

// Sizes are expressed in em relative to the TALENT AGENCY headline font-size,
// so the arrow + handwriting scale together with the responsive headline and
// stay locked relative to it at every viewport.
const DEFAULT_LAYOUT: Layout = {
  arrow: { xPct: 29.6, yPct: -2.1, sizeEm: 0.56, rotation: -19 },
  text: { xPct: 38.9, yPct: 3.5, sizeEm: 0.17, rotation: -14 },
};

type ItemKey = keyof Layout;
type DragMode = "move" | "rotate" | "resize";

const NotAgency = () => {
  // Defaults always win on load — no localStorage override. Edit mode still
  // works in-session for tweaking; just copy the HUD values back into
  // DEFAULT_LAYOUT to bake new positions.
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);

  const editMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("edit") === "1";

  // Live headline font-size in px, used to convert em <-> px for rendering
  // and for the edit-mode resize handle math.
  const [headlinePx, setHeadlinePx] = useState<number>(() => {
    if (typeof window === "undefined") return 100;
    // Mirror clamp(3.5rem, 12vw, 9.5rem) at 16px root.
    const vw = window.innerWidth;
    return Math.max(56, Math.min(152, vw * 0.12));
  });

  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      setHeadlinePx(Math.max(56, Math.min(152, vw * 0.12)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

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

  // No persistence — defaults are the source of truth.

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "The Not Agency";

    return () => {
      document.title = prevTitle;
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
      const hp = headlinePx || 100;
      if (target === "arrow") {
        // dist ≈ half-width in px → convert to em via headline px.
        const newEm = Math.max(0.1, Math.min(8, (dist * 2) / hp));
        setLayout((s) => ({
          ...s,
          arrow: { ...s.arrow, sizeEm: Math.round(newEm * 1000) / 1000 },
        }));
      } else {
        const startDist = Math.hypot(
          d.startX - d.centerX,
          d.startY - d.centerY
        );
        const ratio = startDist > 0 ? dist / startDist : 1;
        const newEm = Math.max(
          0.05,
          Math.min(2, d.startState.sizeEm * ratio)
        );
        setLayout((s) => ({
          ...s,
          text: { ...s.text, sizeEm: Math.round(newEm * 1000) / 1000 },
        }));
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
  const buttonFont = `'Core Bandi', 'TAN St Canard', 'Arial Narrow', Impact, sans-serif`;

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
        <div className="w-full max-w-6xl mx-auto relative">
          {/* Headlines — heroRef is anchored here so the floating arrow + text
              track the headline block at every viewport size. */}
          <div ref={heroRef} className="relative">
            <div className="flex items-start gap-4 sm:gap-6">
              <h1
                style={{
                  fontFamily: displayFont,
                  color: PALE_BLUE,
                  fontSize: "clamp(3rem, 9vw, 7rem)",
                  lineHeight: 0.93,
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
                lineHeight: 0.93,
                letterSpacing: "0",
                margin: 0,
              }}
            >
              ANOTHER
              <br />
              TALENT AGENCY
            </h2>

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
                fontSize: `${layout.text.sizeEm * headlinePx}px`,
                color: ARROW_GREEN,
                lineHeight: 0.85,
                display: "inline-block",
                pointerEvents: "none",
                textAlign: "center",
              }}
            >
              your typical
              <br />
              partnerships
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
              width: layout.arrow.sizeEm * headlinePx,
              height: (layout.arrow.sizeEm * headlinePx) / arrowAspect,
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
              <div>size: {layout.arrow.sizeEm.toFixed(3)}em ({Math.round(layout.arrow.sizeEm * headlinePx)}px)  rot: {layout.arrow.rotation}°</div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>Text</div>
              <div>x: {layout.text.xPct.toFixed(1)}%  y: {layout.text.yPct.toFixed(1)}%</div>
              <div>size: {layout.text.sizeEm.toFixed(3)}em ({Math.round(layout.text.sizeEm * headlinePx)}px)  rot: {layout.text.rotation}°</div>
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

          <div style={{ marginTop: "-0.5em", marginLeft: "0.08em", fontSize: "clamp(3.5rem, 12vw, 9.5rem)" }}>
            <div>
            <a
              href="mailto:lawrence@eight6media.com"
              className="inline-block transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: buttonFont,
                letterSpacing: "0.08em",
                fontSize: "1.05rem",
                color: OLIVE,
                backgroundImage: `url(${envelopeImg})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                padding: "1.75rem 3rem",
                textDecoration: "none",
              }}
            >
              GET IN TOUCH →
            </a>
            </div>
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
