import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/v2/work",         label: "Work" },
  { to: "/v2/roster",       label: "Talent" },
  { to: "/v2/for-brands",   label: "For Brands" },
  { to: "/v2/for-creators", label: "For Creators" },
  { to: "/v2/about",        label: "About" },
];

// Not.-brand fixed nav. Scoped via .v2-root wrapper for CSS vars.
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isLightHero = location.pathname === "/v2/work";
  const logoColor = scrolled || isLightHero ? "var(--dark-brown)" : "var(--sky)";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <nav
      className="v2-root"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: scrolled ? "var(--dark-brown)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(243,255,183,0.15)" : "none",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 2rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/v2"
          style={{
            fontFamily: "var(--font-wordmark)",
            fontSize: "1.5rem",
            color: "var(--sky)",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          NOT.
        </Link>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: "2.5rem" }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color:
                  location.pathname === link.to
                    ? "var(--lemon)"
                    : scrolled
                    ? "rgba(243,255,183,0.65)"
                    : "var(--dark-brown)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--lemon)")}
              onMouseLeave={(e) => {
                if (location.pathname !== link.to) {
                  (e.target as HTMLAnchorElement).style.color = scrolled
                    ? "rgba(243,255,183,0.65)"
                    : "var(--dark-brown)";
                }
              }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/v2/for-brands"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--dark-brown)",
              backgroundColor: "var(--lemon)",
              padding: "0.5rem 1.25rem",
              border: "1px solid var(--dark-brown)",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.target as HTMLAnchorElement;
              el.style.backgroundColor = "var(--indigo)";
              el.style.color = "var(--lemon)";
              el.style.borderColor = "var(--indigo)";
            }}
            onMouseLeave={(e) => {
              const el = e.target as HTMLAnchorElement;
              el.style.backgroundColor = "var(--lemon)";
              el.style.color = "var(--dark-brown)";
              el.style.borderColor = "var(--dark-brown)";
            }}
          >
            Get in Touch →
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: scrolled ? "var(--lemon)" : "var(--dark-brown)",
            padding: "0.5rem",
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            backgroundColor: "var(--dark-brown)",
            borderTop: "1px solid rgba(243,255,183,0.12)",
            padding: "1.5rem 2rem 2rem",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color:
                  location.pathname === link.to
                    ? "var(--lemon)"
                    : "rgba(243,255,183,0.65)",
                padding: "0.75rem 0",
                borderBottom: "1px solid rgba(243,255,183,0.08)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/v2/for-brands"
            style={{
              display: "inline-block",
              marginTop: "1.25rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "var(--dark-brown)",
              backgroundColor: "var(--lemon)",
              padding: "0.75rem 1.5rem",
            }}
          >
            Get in Touch →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
