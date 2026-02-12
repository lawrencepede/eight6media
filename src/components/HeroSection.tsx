import { Button } from "@/components/ui/button";
import heroPhoto from "@/assets/photo-blur-portrait.png";

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative bg-primary pt-20 overflow-hidden">
      {/* Hero image — full-bleed */}
      <div className="w-full aspect-[16/9] md:aspect-[16/7] overflow-hidden">
        <img
          src={heroPhoto}
          alt="Creative motion portrait"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Massive brand name overlaid below image */}
      <div className="px-4 md:px-8 py-6 md:py-10">
        <h1 className="font-display text-accent text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem] leading-[0.85] tracking-tight">
          EIGHT-SIX
        </h1>
      </div>
    </section>
  );
};

export default HeroSection;
