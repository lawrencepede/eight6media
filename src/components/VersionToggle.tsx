import { Link, useLocation } from "react-router-dom";

/**
 * Floating pill that swaps between the v1 and v2 version of the current
 * marketing page. The URL is the source of truth — clicking flips the
 * /v2 prefix on/off while preserving the rest of the path, query, and hash.
 *
 * Visibility is controlled by AppShell; this component just renders.
 */
const VersionToggle = () => {
  const location = useLocation();
  const isV2 = location.pathname === "/v2" || location.pathname.startsWith("/v2/");

  let counterpart: string;
  if (isV2) {
    // /v2 → /, /v2/work → /work
    counterpart = location.pathname === "/v2" ? "/" : location.pathname.slice(3);
  } else {
    // / → /v2, /work → /v2/work
    counterpart = location.pathname === "/" ? "/v2" : `/v2${location.pathname}`;
  }
  counterpart += location.search + location.hash;

  return (
    <Link
      to={counterpart}
      className="fixed bottom-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-foreground/80 shadow-lg backdrop-blur-md transition-colors hover:text-foreground hover:bg-background"
      aria-label={`Switch to ${isV2 ? "v1" : "v2"} version`}
    >
      <span className="opacity-60">Viewing</span>
      <span className="font-semibold">{isV2 ? "v2" : "v1"}</span>
      <span className="opacity-40">→</span>
      <span>{isV2 ? "v1" : "v2"}</span>
    </Link>
  );
};

export default VersionToggle;
