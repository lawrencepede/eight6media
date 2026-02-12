import { Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Big footer brand */}
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl text-accent mb-12">
            EIGHT-SIX MEDIA
          </h2>

          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* About */}
            <div>
              <p className="font-sans text-sm text-primary-foreground/70 uppercase tracking-wide leading-relaxed">
                A selective creator agency delivering authentic partnerships and measurable results.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-display text-xs tracking-widest mb-4 text-primary-foreground/50">NAVIGATE</h4>
              <div className="space-y-2">
                {[
                  { to: "/work", label: "Work" },
                  { to: "/roster", label: "Talent" },
                  { to: "/for-brands", label: "For Brands" },
                  { to: "/for-creators", label: "For Creators" },
                  { to: "/about", label: "About" },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block font-sans text-sm text-primary-foreground/70 hover:text-accent transition-colors uppercase tracking-wide"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-xs tracking-widest mb-4 text-primary-foreground/50">CONTACT</h4>
              <a
                href="mailto:hello@eight6media.com"
                className="flex items-center gap-2 font-sans text-sm text-primary-foreground/70 hover:text-accent transition-colors mb-4"
              >
                <Mail className="w-4 h-4" />
                hello@eight6media.com
              </a>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-xs text-primary-foreground/40 uppercase tracking-wide">
              © {new Date().getFullYear()} Eight-Six Media. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
