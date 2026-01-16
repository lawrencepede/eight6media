import { Instagram, Linkedin, Mail } from "lucide-react";
import logo from "@/assets/logo-option-2.png";

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
              <img src={logo} alt="Eight6Media" className="h-12 w-auto mb-4 brightness-0 invert" />
              <p className="text-primary-foreground/70 mb-4 max-w-md">
                A selective creator agency delivering authentic partnerships and measurable results for brands and creators alike.
              </p>
              <p className="text-accent font-medium italic">
                "Authenticity Drives Sales"
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToSection("approach")}
                  className="block text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Approach
                </button>
                <button
                  onClick={() => scrollToSection("talent")}
                  className="block text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  Talent
                </button>
                <button
                  onClick={() => scrollToSection("brands")}
                  className="block text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  For Brands
                </button>
                <button
                  onClick={() => scrollToSection("creators")}
                  className="block text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  For Creators
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  About
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-4">
                <p className="text-primary-foreground/70">
                  Elizabeth Martin, Founder
                </p>
                <a
                  href="mailto:hello@eight6media.com"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  hello@eight6media.com
                </a>
                <div className="flex gap-4 pt-2">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/50">
              © {new Date().getFullYear()} Eight6Media. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-primary-foreground/50">
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
