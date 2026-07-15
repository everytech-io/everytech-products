// Seed FranchiseIQ data into Postgres from the local (gitignored) JSON.
//
//   DATABASE_URL=... npm run seed
//     (falls back to DIRECT_DATABASE_URL if DATABASE_URL is unset)
//
// Reads scripts/seed/fiq-data.local.json (never committed). The example file
// scripts/seed/fiq-data.example.json documents the shape with dummy rows.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import postgres from "postgres";

const conn = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;
if (!conn) {
  console.error("Missing env: set DATABASE_URL (or DIRECT_DATABASE_URL).");
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

const sql = postgres(conn, { prepare: false });

async function main() {
  console.log("Seeding FranchiseIQ → Postgres");
  // FK order: markets → locations → features/formats.
  for (const m of data.markets) {
    await sql`insert into fiq_market (code, name) values (${m.code}, ${m.name})
              on conflict (code) do update set name = excluded.name`;
  }
  console.log(`  fiq_market: ${data.markets.length}`);

  for (const l of data.locations) {
    await sql`insert into fiq_location (code, market, city, name, lat, lng)
              values (${l.code}, ${l.market}, ${l.city ?? ""}, ${l.name}, ${l.lat}, ${l.lng})
              on conflict (code) do update set
                market = excluded.market, city = excluded.city, name = excluded.name,
                lat = excluded.lat, lng = excluded.lng`;
  }
  console.log(`  fiq_location: ${data.locations.length}`);

  for (const f of data.features) {
    await sql`insert into fiq_features (code, pop, dens, inc, tra, poi, comp)
              values (${f.code}, ${f.pop}, ${f.dens}, ${f.inc}, ${f.tra},
                      ${sql.json(f.poi)}, ${sql.json(f.comp)})
              on conflict (code) do update set
                pop = excluded.pop, dens = excluded.dens, inc = excluded.inc,
                tra = excluded.tra, poi = excluded.poi, comp = excluded.comp`;
  }
  console.log(`  fiq_features: ${data.features.length}`);

  for (const ft of data.formats) {
    await sql`insert into fiq_format
                (id, market, name, color, comp_key, weights, income_floor, anchor_weights)
              values (${ft.id}, ${ft.market}, ${ft.name}, ${ft.color}, ${ft.comp_key},
                      ${sql.json(ft.weights)}, ${ft.income_floor}, ${sql.json(ft.anchor_weights)})
              on conflict (id, market) do update set
                name = excluded.name, color = excluded.color, comp_key = excluded.comp_key,
                weights = excluded.weights, income_floor = excluded.income_floor,
                anchor_weights = excluded.anchor_weights`;
  }
  console.log(`  fiq_format: ${data.formats.length}`);
  console.log("Done.");
}

main()
  .then(() => sql.end())
  .catch(async (e) => {
    console.error("Seed failed:", e.message);
    await sql.end();
    process.exit(1);
  });
