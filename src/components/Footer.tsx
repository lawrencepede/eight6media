import { Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "For Creators",
    links: [
      { to: "/for-creators", label: "Overview" },
      { to: "/roster", label: "Our Talent" },
    ],
  },
  {
    title: "For Brands",
    links: [
      { to: "/for-brands", label: "Overview" },
      { to: "/work", label: "Our Work" },
    ],
  },
  {
    title: "Explore",
    links: [
      { to: "/about", label: "About Us" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-16 md:py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-base text-foreground mb-4">{col.title}</h4>
              <div className="space-y-2">
                {col.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-display text-base text-foreground mb-4">Contact</h4>
            <a
              href="mailto:hello@eight6media.com"
              className="flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <Mail className="w-4 h-4" />
              hello@eight6media.com
            </a>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-display text-lg text-foreground">
            Eight-Six Media
          </Link>
          <p className="font-sans text-xs text-muted-foreground">
            © {new Date().getFullYear()} Eight-Six Media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
