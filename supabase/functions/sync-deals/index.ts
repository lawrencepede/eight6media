import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Sheets URL for Deal Tracking tab (gid=458765882)
const GOOGLE_SHEETS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTl_V694GodmVDA32ZXdsKurxDilhjeC4o7KpUG7M661CwjIJzr4zR03NFoaEvISJAu7CxIEvRx95uM/pub?gid=458765882&single=true&output=csv";

interface DealRow {
  talent_name: string;
  brand_name: string;
  status: string;
}

// Parse CSV handling quoted fields with commas
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  
  return rows;
}

// Find the header row (first row with "Talent" or "Brand" in it)
function findHeaderRow(rows: string[][]): number {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(cell => cell.toLowerCase());
    if (row.some(cell => cell.includes('talent') || cell.includes('brand'))) {
      return i;
    }
  }
  return 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting deal sync from Google Sheets...");

    // Fetch CSV from Google Sheets
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.status}`);
    }

    const csvText = await response.text();
    console.log("CSV fetched, parsing...");

    const rows = parseCSV(csvText);
    console.log(`Parsed ${rows.length} rows`);

    if (rows.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "No data rows found in sheet" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headerRowIndex = findHeaderRow(rows);
    console.log(`Header row at index: ${headerRowIndex}`);

    // Column mapping: B (index 1) = talent, C (index 2) = brand, J (index 9) = status
    const TALENT_COL = 1;  // Column B
    const BRAND_COL = 2;   // Column C
    const STATUS_COL = 9;  // Column J

    // Parse deals from rows after header
    const deals: DealRow[] = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      
      const talent_name = row[TALENT_COL]?.trim() || "";
      const brand_name = row[BRAND_COL]?.trim() || "";
      const status = row[STATUS_COL]?.trim() || "Pipeline";

      // Skip rows without talent or brand
      if (!talent_name || !brand_name) {
        continue;
      }

      deals.push({ talent_name, brand_name, status });
    }

    console.log(`Found ${deals.length} valid deals to sync`);

    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert deals
    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const deal of deals) {
      const { error } = await supabase
        .from("deals")
        .upsert(
          {
            talent_name: deal.talent_name,
            brand_name: deal.brand_name,
            status: deal.status,
            synced_at: new Date().toISOString(),
          },
          {
            onConflict: "talent_name,brand_name",
          }
        );

      if (error) {
        console.error(`Error upserting deal ${deal.talent_name} - ${deal.brand_name}:`, error);
        errors.push(`${deal.talent_name}/${deal.brand_name}: ${error.message}`);
      } else {
        // We can't easily distinguish insert vs update with upsert, count as synced
        insertedCount++;
      }
    }

    console.log(`Sync complete: ${insertedCount} deals synced, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully synced ${insertedCount} deals from Google Sheets`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error syncing deals:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
