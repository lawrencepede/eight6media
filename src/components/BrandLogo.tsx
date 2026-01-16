import nikeLogo from "@/assets/logos/nike.svg";
import appleLogo from "@/assets/logos/apple.svg";
import garminLogo from "@/assets/logos/garmin.svg";

const brandLogos: Record<string, string> = {
  "Nike": nikeLogo,
  "Apple": appleLogo,
  "Garmin": garminLogo,
};

interface BrandLogoProps {
  brand: string;
}

const BrandLogo = ({ brand }: BrandLogoProps) => {
  const logo = brandLogos[brand];
  
  if (logo) {
    return (
      <div className="flex items-center justify-center bg-secondary/50 px-3 py-2 rounded-lg h-8">
        <img 
          src={logo} 
          alt={brand} 
          className="h-4 w-auto opacity-70"
        />
      </div>
    );
  }
  
  // Fallback to styled text for brands without logos
  return (
    <span className="text-xs bg-secondary px-3 py-1.5 rounded-full text-secondary-foreground font-medium">
      {brand}
    </span>
  );
};

export default BrandLogo;
