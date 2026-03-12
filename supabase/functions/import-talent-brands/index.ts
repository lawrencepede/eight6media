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
    const BRANDFETCH_CLIENT_ID = Deno.env.get("BRANDFETCH_CLIENT_ID");

    const { talent_brands, fetch_logos_for } = await req.json();

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

    // 4. Create brand_assets for brands that don't exist yet
    const brandsToCreate = [...allBrands].filter(b => !brandMap.has(b));
    for (const brandName of brandsToCreate) {
      const domain = brandName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
      const { data: newBrand, error } = await supabase
        .from("brand_assets")
        .insert({ name: brandName, domain })
        .select("id, name")
        .single();

      if (error) {
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

    // 6. Fetch logos using the Logo API CDN
    if (BRANDFETCH_CLIENT_ID && fetch_logos_for?.length > 0) {
      // Build a map of brand name -> stored domain from DB
      const brandIds = [...new Set(fetch_logos_for.map((n: string) => brandMap.get(n.toUpperCase().trim())).filter(Boolean))];
      const { data: brandRows } = await supabase
        .from("brand_assets")
        .select("id, name, domain")
        .in("id", brandIds);
      const domainLookup = new Map<string, string>();
      for (const b of (brandRows || [])) {
        domainLookup.set(b.id, b.domain);
      }

      for (const brandName of fetch_logos_for) {
        const brandId = brandMap.get(brandName.toUpperCase().trim());
        if (!brandId) continue;

        // Use stored domain from DB, fallback to guess
        const storedDomain = domainLookup.get(brandId);
        const fetchDomain = storedDomain || (brandName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com");

        try {
          const logoApiUrl = `https://cdn.brandfetch.io/${fetchDomain}/logo?c=${BRANDFETCH_CLIENT_ID}`;
          const iconApiUrl = `https://cdn.brandfetch.io/${fetchDomain}/icon?c=${BRANDFETCH_CLIENT_ID}`;

          let storedLogo: string | null = null;
          let storedIcon: string | null = null;

          // Helper: validate response is an actual image
          const isValidImage = (res: Response) => {
            const ct = res.headers.get("content-type") || "";
            return res.ok && ct.startsWith("image/");
          };

          // Download logo
          const logoRes = await fetch(logoApiUrl, { redirect: "follow" });
          if (isValidImage(logoRes)) {
            const blob = await logoRes.blob();
            const contentType = logoRes.headers.get("content-type") || "image/png";
            const ext = contentType.includes("svg") ? "svg" : contentType.includes("webp") ? "webp" : "png";
            const path = `${fetchDomain}/logo.${ext}`;
            const { error: upErr } = await supabase.storage.from("brand-logos")
              .upload(path, blob, { contentType, upsert: true });
            if (!upErr) {
              storedLogo = supabase.storage.from("brand-logos").getPublicUrl(path).data.publicUrl;
            }
          }

          // Download icon
          const iconRes = await fetch(iconApiUrl, { redirect: "follow" });
          if (isValidImage(iconRes)) {
            const blob = await iconRes.blob();
            const contentType = iconRes.headers.get("content-type") || "image/png";
            const ext = contentType.includes("svg") ? "svg" : contentType.includes("webp") ? "webp" : "png";
            const path = `${fetchDomain}/icon.${ext}`;
            const { error: upErr } = await supabase.storage.from("brand-logos")
              .upload(path, blob, { contentType, upsert: true });
            if (!upErr) {
              storedIcon = supabase.storage.from("brand-logos").getPublicUrl(path).data.publicUrl;
            }
          }

          if (storedLogo || storedIcon) {
            await supabase.from("brand_assets").update({
              logo_url: storedLogo,
              icon_url: storedIcon,
            }).eq("id", brandId);

            results.logos_fetched++;
          }
        } catch (e: any) {
          results.errors.push(`Logo fetch error for ${brandName}: ${e.message}`);
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
