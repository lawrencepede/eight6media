import { Instagram, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="font-display text-3xl mb-4">
                <span className="text-primary-foreground">EIGHT</span>
                <span className="text-accent">-SIX</span>
              </h3>
              <p className="font-script text-2xl text-primary-foreground/80 mb-4 max-w-md">
                A selective creator agency delivering authentic partnerships and measurable results.
              </p>
              <p className="text-accent font-script text-xl">
                "Authenticity Drives Sales"
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-sm tracking-wide mb-4">QUICK LINKS</h4>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToSection("approach")}
                  className="block font-script text-xl text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Approach
                </button>
                <button
                  onClick={() => scrollToSection("talent")}
                  className="block font-script text-xl text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Talent
                </button>
                <button
                  onClick={() => scrollToSection("brands")}
                  className="block font-script text-xl text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  For Brands
                </button>
                <button
                  onClick={() => scrollToSection("creators")}
                  className="block font-script text-xl text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  For Creators
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block font-script text-xl text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  About
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm tracking-wide mb-4">CONTACT</h4>
              <div className="space-y-4">
                <p className="font-script text-xl text-primary-foreground/70">
                  Elizabeth Martin, Founder
                </p>
                <a
                  href="mailto:hello@eight6media.com"
                  className="flex items-center gap-2 font-script text-xl text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@eight6media.com
                </a>
                <div className="flex gap-4 pt-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-accent-foreground transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-sm text-primary-foreground/50">
              © {new Date().getFullYear()} Eight-Six Media. All rights reserved.
            </p>
            <div className="flex gap-6 font-sans text-sm text-primary-foreground/50">
              <a href="#" className="hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;