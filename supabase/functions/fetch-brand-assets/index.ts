import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BRANDFETCH_API_KEY = Deno.env.get("BRANDFETCH_API_KEY");
    if (!BRANDFETCH_API_KEY) {
      throw new Error("BRANDFETCH_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domain } = await req.json();
    if (!domain) {
      throw new Error("Domain is required");
    }

    // Clean domain
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();

    console.log(`Fetching brand data for: ${cleanDomain}`);

    // Call Brandfetch API
    const brandRes = await fetch(
      `https://api.brandfetch.io/v2/brands/${cleanDomain}`,
      {
        headers: {
          Authorization: `Bearer ${BRANDFETCH_API_KEY}`,
        },
      }
    );

    if (!brandRes.ok) {
      const errorText = await brandRes.text();
      throw new Error(`Brandfetch API error [${brandRes.status}]: ${errorText}`);
    }

    const brandData = await brandRes.json();

    // Extract best logo and icon URLs
    let logoUrl: string | null = null;
    let iconUrl: string | null = null;

    if (brandData.logos) {
      // Find primary logo (prefer SVG, then PNG)
      const logoEntry = brandData.logos.find((l: any) => l.type === "logo") || brandData.logos[0];
      if (logoEntry?.formats) {
        const svgFormat = logoEntry.formats.find((f: any) => f.format === "svg");
        const pngFormat = logoEntry.formats.find((f: any) => f.format === "png");
        logoUrl = svgFormat?.src || pngFormat?.src || logoEntry.formats[0]?.src || null;
      }

      const iconEntry = brandData.logos.find((l: any) => l.type === "icon");
      if (iconEntry?.formats) {
        const svgFormat = iconEntry.formats.find((f: any) => f.format === "svg");
        const pngFormat = iconEntry.formats.find((f: any) => f.format === "png");
        iconUrl = svgFormat?.src || pngFormat?.src || iconEntry.formats[0]?.src || null;
      }
    }

    // Download and store the logo in storage if available
    let storedLogoUrl: string | null = null;
    let storedIconUrl: string | null = null;

    if (logoUrl) {
      try {
        const logoRes = await fetch(logoUrl);
        const logoBlob = await logoRes.blob();
        const ext = logoUrl.includes(".svg") ? "svg" : "png";
        const logoPath = `${cleanDomain}/logo.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("brand-logos")
          .upload(logoPath, logoBlob, {
            contentType: ext === "svg" ? "image/svg+xml" : "image/png",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("brand-logos")
            .getPublicUrl(logoPath);
          storedLogoUrl = urlData.publicUrl;
        } else {
          console.error("Logo upload error:", uploadError);
          storedLogoUrl = logoUrl; // Fallback to Brandfetch CDN
        }
      } catch (e) {
        console.error("Logo download error:", e);
        storedLogoUrl = logoUrl;
      }
    }

    if (iconUrl) {
      try {
        const iconRes = await fetch(iconUrl);
        const iconBlob = await iconRes.blob();
        const ext = iconUrl.includes(".svg") ? "svg" : "png";
        const iconPath = `${cleanDomain}/icon.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("brand-logos")
          .upload(iconPath, iconBlob, {
            contentType: ext === "svg" ? "image/svg+xml" : "image/png",
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("brand-logos")
            .getPublicUrl(iconPath);
          storedIconUrl = urlData.publicUrl;
        } else {
          console.error("Icon upload error:", uploadError);
          storedIconUrl = iconUrl;
        }
      } catch (e) {
        console.error("Icon download error:", e);
        storedIconUrl = iconUrl;
      }
    }

    // Extract colors
    const brandColors = brandData.colors?.map((c: any) => ({
      hex: c.hex,
      type: c.type,
      brightness: c.brightness,
    })) || [];

    // Extract industry
    const industry = brandData.company?.industries?.map((i: any) => 
      typeof i === "string" ? i : i.name || i.slug
    )?.join(", ") || null;

    // Upsert brand_assets
    const { data: brandAsset, error: upsertError } = await supabase
      .from("brand_assets")
      .upsert(
        {
          name: brandData.name || cleanDomain,
          domain: cleanDomain,
          logo_url: storedLogoUrl,
          icon_url: storedIconUrl,
          brand_colors: brandColors,
          industry,
          description: brandData.description || null,
          raw_data: brandData,
        },
        { onConflict: "domain" }
      )
      .select()
      .single();

    if (upsertError) {
      throw new Error(`Database upsert error: ${upsertError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, brand: brandAsset }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error fetching brand assets:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
