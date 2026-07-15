// Seed FranchiseIQ data into Supabase from the local (gitignored) JSON.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
//
// Reads scripts/seed/fiq-data.local.json (never committed). The example file
// scripts/seed/fiq-data.example.json documents the shape with dummy rows.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing env: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, "seed", "fiq-data.local.json");
let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch {
  console.error(`Cannot read ${file}. Generate the local seed first (never commit it).`);
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table, rows, onConflict) {
  if (!rows?.length) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: upserted ${rows.length} rows`);
}

async function main() {
  console.log("Seeding FranchiseIQ →", url);
  // FK order: markets → locations → features/formats.
  await upsert("fiq_market", data.markets, "code");
  await upsert("fiq_location", data.locations, "code");
  await upsert("fiq_features", data.features, "code");
  await upsert("fiq_format", data.formats, "id,market");
  console.log("Done.");
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
