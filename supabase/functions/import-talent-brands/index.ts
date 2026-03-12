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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const BRANDFETCH_API_KEY = Deno.env.get("BRANDFETCH_API_KEY");

    const { talent_brands, fetch_logos_for } = await req.json();
    // talent_brands: Array<{ talent_name: string, brands: string[] }>
    // fetch_logos_for: string[] — optional list of brand names to fetch logos for

    // 1. Get all creators
    const { data: creators } = await supabase.from("creators").select("id, name");
    if (!creators) throw new Error("Could not fetch creators");

    const creatorMap = new Map<string, string>();
    for (const c of creators) {
      creatorMap.set(c.name.toLowerCase().trim(), c.id);
    }

    const results = {
      matched_talent: 0,
      unmatched_talent: [] as string[],
      brands_created: 0,
      relationships_created: 0,
      logos_fetched: 0,
      errors: [] as string[],
    };

    // 2. Collect all unique brand names
    const allBrands = new Set<string>();
    for (const entry of talent_brands) {
      for (const brand of entry.brands) {
        const cleaned = brand.trim().toUpperCase();
        if (cleaned && cleaned !== "COMING SOON." && cleaned !== "INFO COMING SOON" && 
            !["WELLNESS", "LIFESTYLE"].includes(cleaned)) {
          allBrands.add(cleaned);
        }
      }
    }

    // 3. Get existing brand_assets
    const { data: existingBrands } = await supabase.from("brand_assets").select("id, name");
    const brandMap = new Map<string, string>();
    for (const b of (existingBrands || [])) {
      brandMap.set(b.name.toUpperCase().trim(), b.id);
    }

    // 4. Create brand_assets for brands that don't exist yet (without logos)
    const brandsToCreate = [...allBrands].filter(b => !brandMap.has(b));
    for (const brandName of brandsToCreate) {
      const domain = brandName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
      const { data: newBrand, error } = await supabase
        .from("brand_assets")
        .insert({ name: brandName, domain })
        .select("id, name")
        .single();

      if (error) {
        // Might be duplicate domain — try with suffix
        const { data: retry, error: retryErr } = await supabase
          .from("brand_assets")
          .insert({ name: brandName, domain: `${domain.replace('.com', '')}-brand.com` })
          .select("id, name")
          .single();
        if (retryErr) {
          results.errors.push(`Failed to create brand: ${brandName} - ${retryErr.message}`);
          continue;
        }
        brandMap.set(brandName, retry.id);
      } else {
        brandMap.set(brandName, newBrand.id);
      }
      results.brands_created++;
    }

    // 5. Create talent-brand relationships
    for (const entry of talent_brands) {
      const creatorId = creatorMap.get(entry.talent_name.toLowerCase().trim());
      if (!creatorId) {
        results.unmatched_talent.push(entry.talent_name);
        continue;
      }
      results.matched_talent++;

      for (const brand of entry.brands) {
        const cleaned = brand.trim().toUpperCase();
        if (!cleaned || cleaned === "COMING SOON." || cleaned === "INFO COMING SOON" ||
            ["WELLNESS", "LIFESTYLE"].includes(cleaned)) continue;

        const brandId = brandMap.get(cleaned);
        if (!brandId) continue;

        const { error } = await supabase
          .from("talent_brand_relationships")
          .upsert(
            { creator_id: creatorId, brand_id: brandId, status: "completed" },
            { onConflict: "creator_id,brand_id,campaign_name" }
          );

        if (error) {
          results.errors.push(`Link error: ${entry.talent_name} × ${cleaned} - ${error.message}`);
        } else {
          results.relationships_created++;
        }
      }
    }

    // 6. Optionally fetch logos for specified brands
    if (BRANDFETCH_API_KEY && fetch_logos_for?.length > 0) {
      for (const brandName of fetch_logos_for) {
        const brandId = brandMap.get(brandName.toUpperCase().trim());
        if (!brandId) continue;

        // Guess domain
        const guessDomain = brandName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
        
        try {
          const brandRes = await fetch(
            `https://api.brandfetch.io/v2/brands/${guessDomain}`,
            { headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` } }
          );

          if (!brandRes.ok) {
            const errorText = await brandRes.text();
            results.errors.push(`Brandfetch ${brandName}: ${brandRes.status} - ${errorText}`);
            continue;
          }

          const brandData = await brandRes.json();

          let logoUrl: string | null = null;
          let iconUrl: string | null = null;

          if (brandData.logos) {
            const logoEntry = brandData.logos.find((l: any) => l.type === "logo") || brandData.logos[0];
            if (logoEntry?.formats) {
              const svgF = logoEntry.formats.find((f: any) => f.format === "svg");
              const pngF = logoEntry.formats.find((f: any) => f.format === "png");
              logoUrl = svgF?.src || pngF?.src || logoEntry.formats[0]?.src || null;
            }
            const iconEntry = brandData.logos.find((l: any) => l.type === "icon");
            if (iconEntry?.formats) {
              const svgF = iconEntry.formats.find((f: any) => f.format === "svg");
              const pngF = iconEntry.formats.find((f: any) => f.format === "png");
              iconUrl = svgF?.src || pngF?.src || iconEntry.formats[0]?.src || null;
            }
          }

          // Download and store logos
          let storedLogo = logoUrl;
          let storedIcon = iconUrl;
          const actualDomain = brandData.domain || guessDomain;

          if (logoUrl) {
            try {
              const res = await fetch(logoUrl);
              const blob = await res.blob();
              const ext = logoUrl.includes(".svg") ? "svg" : "png";
              const path = `${actualDomain}/logo.${ext}`;
              const { error: upErr } = await supabase.storage.from("brand-logos")
                .upload(path, blob, { contentType: ext === "svg" ? "image/svg+xml" : "image/png", upsert: true });
              if (!upErr) {
                storedLogo = supabase.storage.from("brand-logos").getPublicUrl(path).data.publicUrl;
              }
            } catch (_) { /* fallback to CDN URL */ }
          }

          if (iconUrl) {
            try {
              const res = await fetch(iconUrl);
              const blob = await res.blob();
              const ext = iconUrl.includes(".svg") ? "svg" : "png";
              const path = `${actualDomain}/icon.${ext}`;
              const { error: upErr } = await supabase.storage.from("brand-logos")
                .upload(path, blob, { contentType: ext === "svg" ? "image/svg+xml" : "image/png", upsert: true });
              if (!upErr) {
                storedIcon = supabase.storage.from("brand-logos").getPublicUrl(path).data.publicUrl;
              }
            } catch (_) { /* fallback */ }
          }

          const colors = brandData.colors?.map((c: any) => ({ hex: c.hex, type: c.type })) || [];
          const industry = brandData.company?.industries?.map((i: any) => 
            typeof i === "string" ? i : i.name || i.slug
          )?.join(", ") || null;

          await supabase.from("brand_assets").update({
            logo_url: storedLogo,
            icon_url: storedIcon,
            brand_colors: colors,
            industry,
            description: brandData.description || null,
            domain: actualDomain,
            raw_data: brandData,
          }).eq("id", brandId);

          results.logos_fetched++;
        } catch (e: any) {
          results.errors.push(`Brandfetch error for ${brandName}: ${e.message}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Import error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
