import blurPortrait from "@/assets/photo-blur-portrait.png";
import glassPhoto from "@/assets/photo-glass.png";
import streetPhoto from "@/assets/photo-street.png";
import swirlPhoto from "@/assets/photo-swirl.png";
import womanPhoto from "@/assets/photo-woman.png";
import bokehPhoto from "@/assets/photo-bokeh.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const images = [
  { src: streetPhoto, alt: "Street scene" },
  { src: blurPortrait, alt: "Portrait" },
  { src: glassPhoto, alt: "Glass texture" },
  { src: swirlPhoto, alt: "Light swirl" },
  { src: womanPhoto, alt: "Creative portrait" },
  { src: bokehPhoto, alt: "City lights" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* 3x2 image grid as background */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden">
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Centered text overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.1] max-w-4xl mb-6">
          Created by the <em className="italic text-accent">passionate,</em>
          <br />
          not the algorithm.
        </h1>
        <p className="font-sans text-sm md:text-base text-foreground/70 max-w-lg mb-10 tracking-wide">
          Authentic creator partnerships that deliver genuine value and measurable results.
        </p>
        <Button
          className="rounded-none bg-transparent border border-foreground/40 text-foreground hover:bg-foreground hover:text-background px-10 py-6 font-sans text-xs tracking-[0.2em] uppercase"
          asChild
        >
          <Link to="/roster">Explore Creators</Link>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
