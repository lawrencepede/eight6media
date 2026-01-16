import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-serif text-2xl font-bold tracking-tight"
          >
            <span className="text-primary">Eight</span>
            <span className="text-accent">-Six</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("approach")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Approach
            </button>
            <button
              onClick={() => scrollToSection("talent")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Talent
            </button>
            <button
              onClick={() => scrollToSection("brands")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              For Brands
            </button>
            <button
              onClick={() => scrollToSection("creators")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              For Creators
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
            >
              Get Started
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
              <button
                onClick={() => scrollToSection("approach")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Approach
              </button>
              <button
                onClick={() => scrollToSection("talent")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Talent
              </button>
              <button
                onClick={() => scrollToSection("brands")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                For Brands
              </button>
              <button
                onClick={() => scrollToSection("creators")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                For Creators
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </button>
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium w-fit"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
