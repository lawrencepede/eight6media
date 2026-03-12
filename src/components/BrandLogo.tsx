import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import nikeLogo from "@/assets/logos/nike.svg";
import appleLogo from "@/assets/logos/apple.svg";
import garminLogo from "@/assets/logos/garmin.svg";

// Local fallback logos
const localLogos: Record<string, string> = {
  "Nike": nikeLogo,
  "Apple": appleLogo,
  "Garmin": garminLogo,
};

interface BrandLogoProps {
  brand: string;
  className?: string;
  showName?: boolean;
}

const useBrandLogo = (brandName: string) => {
  return useQuery({
    queryKey: ["brand-logo", brandName],
    queryFn: async () => {
      // Try exact match first, then fuzzy match without spaces
      const { data } = await supabase
        .from("brand_assets")
        .select("icon_url, logo_url, name")
        .ilike("name", brandName)
        .maybeSingle();
      
      if (data) return data;
      
      // Fallback: match without spaces/special chars
      const normalized = brandName.replace(/\s+/g, "").toUpperCase();
      const { data: allBrands } = await supabase
        .from("brand_assets")
        .select("icon_url, logo_url, name");
      
      return allBrands?.find(b => b.name.replace(/\s+/g, "").toUpperCase() === normalized) || null;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 min
  });
};

const BrandLogo = ({ brand, className, showName = false }: BrandLogoProps) => {
  const { data: brandAsset } = useBrandLogo(brand);
  
  const logoSrc = brandAsset?.logo_url || brandAsset?.icon_url || localLogos[brand];
  
  if (logoSrc) {
    return (
      <div className={`flex items-center gap-1.5 ${className || ""}`}>
        <div className="flex items-center justify-center bg-[hsl(0_0%_92%)] dark:bg-[hsl(0_0%_40%)] px-2 py-1.5 rounded-lg h-7">
          <img 
            src={logoSrc} 
            alt={brand} 
            className="h-4 w-auto max-w-[48px] object-contain dark:brightness-[1.6] dark:contrast-[1.1]"
          />
        </div>
        {showName && (
          <span className="text-xs text-muted-foreground">{brand}</span>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs bg-secondary px-2.5 py-1 rounded-full text-secondary-foreground font-medium">
        {brand}
      </span>
      <span className="text-[10px] text-muted-foreground italic">No logo</span>
    </div>
  );
};

export default BrandLogo;
