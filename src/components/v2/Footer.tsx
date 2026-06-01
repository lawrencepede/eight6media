import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail } from "lucide-react";

const COLUMNS = [
  {
    heading: "For Creators",
    links: [
      { to: "/v2/for-creators", label: "Overview" },
      { to: "/v2/roster", label: "Our Talent" },
    ],
  },
  {
    heading: "For Brands",
    links: [
      { to: "/v2/for-brands", label: "Overview" },
      { to: "/v2/work", label: "Our Work" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { to: "/v2/about", label: "About" },
      { to: "/v2/for-brands", label: "Get in Touch" },
    ],
  },
];

const Footer = () => (
  <footer
    style={{
      backgroundColor: "var(--dark-brown)",
      borderTop: "1px solid rgba(243,255,183,0.12)",
      padding: "4rem 2rem 2.5rem",
    }}
  >
    <div style={{ maxWidth: 1300, margin: "0 auto", width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "3rem",
          alignItems: "start",
          marginBottom: "3rem",
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/v2"
          style={{
            fontFamily: "var(--font-wordmark)",
            fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
            color: "var(--sky)",
            lineHeight: 0.93,
            letterSpacing: "-0.01em",
            display: "block",
          }}
        >
          NOT.
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: "3rem" }}>
          {COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <p
                className="label"
                style={{ color: "var(--lemon)", opacity: 0.4, marginBottom: "1rem" }}
              >
                {heading}
              </p>
              {links.map(({ to, label }) => (
                <Link
                  key={to + label}
                  to={to}
                  style={{
                    display: "block",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8125rem",
                    color: "rgba(243,255,183,0.65)",
                    marginBottom: "0.5rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--lemon)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(243,255,183,0.65)";
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(243,255,183,0.12)",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <a
            href="mailto:elizabeth@eight6media.com"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              color: "rgba(243,255,183,0.55)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--lemon)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(243,255,183,0.55)";
            }}
          >
            <Mail size={14} />
            elizabeth@eight6media.com
          </a>

          {[
            { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
            { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                border: "1px solid rgba(243,255,183,0.2)",
                color: "rgba(243,255,183,0.55)",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "var(--lemon)";
                el.style.color = "var(--lemon)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = "rgba(243,255,183,0.2)";
                el.style.color = "rgba(243,255,183,0.55)";
              }}
            >
              <Icon size={14} />
            </a>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            color: "rgba(243,255,183,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          © {new Date().getFullYear()} Eight-Six Media. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
