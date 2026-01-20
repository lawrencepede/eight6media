import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: "/work", label: "WORK" },
    { to: "/roster", label: "TALENT" },
    { to: "/for-brands", label: "FOR BRANDS" },
    { to: "/for-creators", label: "FOR CREATORS" },
    { to: "/about", label: "ABOUT" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-2xl tracking-tight"
          >
            <span className="text-primary">EIGHT</span>
            <span className="text-accent">-SIX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-display text-sm tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? "text-accent"
                    : "text-primary hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-wide rounded-none"
            >
              <Link to="/for-brands">GET STARTED</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={`font-display text-sm tracking-wide transition-colors ${
                    location.pathname === link.to
                      ? "text-accent"
                      : "text-primary hover:text-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-wide w-fit rounded-none"
              >
                <Link to="/for-brands" onClick={closeMobileMenu}>
                  GET STARTED
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;