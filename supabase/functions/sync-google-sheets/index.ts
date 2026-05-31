import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTl_V694GodmVDA32ZXdsKurxDilhjeC4o7KpUG7M661CwjIJzr4zR03NFoaEvISJAu7CxIEvRx95uM/pub?gid=2014316368&single=true&output=csv";

interface CreatorRow {
  name: string;
  instagram_handle: string;
  location: string | null;
  followers: string | null;
  niche: string | null;
  bio: string | null;
  tiktok_handle: string | null;
  metrics: {
    igFollowers?: string;
    tiktokFollowers?: string;
    engagementRate?: string;
    storyViews?: string;
    monthlyImpressions?: string;
  };
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Skip the next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      if (char === "\r") i++; // Skip \n in \r\n
    } else {
      currentCell += char;
    }
  }

  // Handle last row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function findHeaderRow(rows: string[][]): number {
  // Look for a row that contains "TALENT" as it's a key column
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const row = rows[i];
    if (row.some(cell => cell.toUpperCase().includes("TALENT"))) {
      return i;
    }
  }
  return 0; // Default to first row
}

function mapColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h.toUpperCase().includes(name.toUpperCase())
    );
    if (index !== -1) return index;
  }
  return -1;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require an authenticated user before running the sync
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (_e) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    console.log("Fetching Google Sheets CSV...");

    
    // Fetch the CSV
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log(`Fetched CSV, length: ${csvText.length}`);
    
    // Parse CSV
    const rows = parseCSV(csvText);
    console.log(`Parsed ${rows.length} rows`);
    
    // Find header row
    const headerRowIndex = findHeaderRow(rows);
    const headers = rows[headerRowIndex] || [];
    console.log(`Header row index: ${headerRowIndex}, headers: ${headers.slice(0, 10).join(", ")}...`);
    
    // Map columns - adjust based on your actual sheet structure
    const colMap = {
      name: mapColumnIndex(headers, ["TALENT", "NAME", "CREATOR"]),
      niche: mapColumnIndex(headers, ["INDUSTRY", "NICHE", "VERTICAL"]),
      igFollowers: mapColumnIndex(headers, ["FLWR COUNT", "IG FOLLOWERS", "FOLLOWERS"]),
      tiktokFollowers: mapColumnIndex(headers, ["TIKTOK FLWRS", "TIKTOK"]),
      engagementRate: mapColumnIndex(headers, ["ENGAGE", "ENGAGEMENT"]),
      impressions: mapColumnIndex(headers, ["REACH", "IMPRESSIONS"]),
      location: mapColumnIndex(headers, ["LOCATION", "CITY"]),
      bio: mapColumnIndex(headers, ["SNAPSHOT", "BIO", "ABOUT"]),
      partners: mapColumnIndex(headers, ["PARTNERS", "BRANDS"]),
    };
    
    console.log("Column mapping:", colMap);
    
    // Parse data rows (skip header rows)
    const creators: CreatorRow[] = [];
    
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Get name - skip if empty
      const name = colMap.name >= 0 ? row[colMap.name]?.trim() : "";
      if (!name || name.length < 2) continue;
      
      // Skip rows that look like headers or empty
      if (name.toUpperCase() === "TALENT" || name.toUpperCase() === "NAME") continue;
      
      // Generate Instagram handle from name if not available
      const instagramHandle = "@" + name.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      const creator: CreatorRow = {
        name,
        instagram_handle: instagramHandle,
        location: colMap.location >= 0 ? row[colMap.location]?.trim() || null : null,
        followers: colMap.igFollowers >= 0 ? row[colMap.igFollowers]?.trim() || null : null,
        niche: colMap.niche >= 0 ? row[colMap.niche]?.trim() || null : null,
        bio: colMap.bio >= 0 ? row[colMap.bio]?.trim() || null : null,
        tiktok_handle: null,
        metrics: {
          igFollowers: colMap.igFollowers >= 0 ? row[colMap.igFollowers]?.trim() : undefined,
          tiktokFollowers: colMap.tiktokFollowers >= 0 ? row[colMap.tiktokFollowers]?.trim() : undefined,
          engagementRate: colMap.engagementRate >= 0 ? row[colMap.engagementRate]?.trim() : undefined,
          monthlyImpressions: colMap.impressions >= 0 ? row[colMap.impressions]?.trim() : undefined,
        },
      };
      
      creators.push(creator);
    }
    
    console.log(`Parsed ${creators.length} creators`);
    
    if (creators.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No creators found in sheet. Check column mapping.",
          headers: headers.slice(0, 20),
          sampleRow: rows[headerRowIndex + 1]?.slice(0, 20),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Upsert creators - match by name
    let updated = 0;
    let inserted = 0;
    const errors: string[] = [];
    
    for (const creator of creators) {
      // Check if creator exists by name
      const { data: existing } = await supabase
        .from("creators")
        .select("id")
        .ilike("name", creator.name)
        .maybeSingle();
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("creators")
          .update({
            location: creator.location,
            followers: creator.followers,
            niche: creator.niche,
            bio: creator.bio,
            metrics: creator.metrics,
          })
          .eq("id", existing.id);
        
        if (error) {
          errors.push(`Update ${creator.name}: ${error.message}`);
        } else {
          updated++;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from("creators")
          .insert({
            name: creator.name,
            instagram_handle: creator.instagram_handle,
            location: creator.location,
            followers: creator.followers,
            niche: creator.niche,
            bio: creator.bio,
            metrics: creator.metrics,
          });
        
        if (error) {
          errors.push(`Insert ${creator.name}: ${error.message}`);
        } else {
          inserted++;
        }
      }
    }
    
    console.log(`Sync complete: ${inserted} inserted, ${updated} updated, ${errors.length} errors`);
    
    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        updated,
        total: creators.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});