// Phase 2 discovery: verify real F&B chains against the ICP (5+ outlets, any Indian city)
// using Google Places API (New) Text Search — compliant discovery per ARCHITECTURE.md §3.
// Pre-filters candidates against the exclusion list (already-processed accounts) before
// spending any API quota, and persists progress so a daily scheduled run resumes where
// the last one left off / stopped on a quota error, rather than re-querying known names.
//
// Usage: GOOGLE_PLACES_API_KEY=... node scripts/discover-brands.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ALL_CANDIDATES } from "./candidates.mjs";
import { loadExclusionSet, findExclusionMatch } from "./lib/exclusion.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const PROGRESS_FILE = join(DATA_DIR, "discovery-progress.json");

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error("Set GOOGLE_PLACES_API_KEY in the environment first.");
  process.exit(1);
}

function loadProgress() {
  if (!existsSync(PROGRESS_FILE)) return { tried: {} };
  return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
}

function saveProgress(progress) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function searchTextPage(query, pageToken) {
  const body = pageToken ? { textQuery: query, pageToken } : { textQuery: query, pageSize: 20 };
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.addressComponents,nextPageToken",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Places API error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function isInIndia(place) {
  const comp = (place.addressComponents ?? []).find((c) => c.types?.includes("country"));
  if (comp) return comp.shortText === "IN";
  return (place.formattedAddress ?? "").includes("India");
}

function extractCity(place) {
  const comp = (place.addressComponents ?? []).find((c) => c.types?.includes("locality"));
  if (comp) return comp.longText;
  const parts = (place.formattedAddress ?? "").split(",").map((p) => p.trim());
  return parts.length >= 3 ? parts[parts.length - 3] : parts[0] ?? "Unknown";
}

async function discoverBrand(name) {
  const query = `${name} restaurant India`;
  let allPlaces = [];
  let pageToken;
  for (let i = 0; i < 3; i++) {
    const data = await searchTextPage(query, pageToken);
    allPlaces = allPlaces.concat(data.places ?? []);
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  const indiaPlaces = allPlaces.filter(isInIndia);
  const cities = new Set();
  for (const p of indiaPlaces) cities.add(extractCity(p));
  return { name, outlet_count: indiaPlaces.length, cities: Array.from(cities).filter(Boolean) };
}

async function main() {
  const exclusionSet = loadExclusionSet();
  const progress = loadProgress();

  // Pre-filter: skip anything already tried, or that fuzzy-matches the exclusion list —
  // neither should cost API quota.
  const toTry = ALL_CANDIDATES.filter((name) => {
    if (progress.tried[name]) return false;
    const match = findExclusionMatch(name, exclusionSet);
    if (match) {
      progress.tried[name] = { result: "excluded", matchedAgainst: match };
      return false;
    }
    return true;
  });

  console.error(`${toTry.length} candidates to try (${ALL_CANDIDATES.length - toTry.length} skipped: already tried or excluded).`);

  const newIcpMatches = [];
  let quotaHit = false;

  for (const name of toTry) {
    try {
      const result = await discoverBrand(name);
      const icpMatch = result.outlet_count >= 5;
      progress.tried[name] = {
        result: icpMatch ? "icp_match" : "below_icp",
        outlet_count: result.outlet_count,
        cities: result.cities,
      };
      if (icpMatch) newIcpMatches.push(result);
      console.error(`${name}: ${result.outlet_count} outlets across ${result.cities.length} cities${icpMatch ? " -> ICP MATCH" : ""}`);
    } catch (err) {
      if (err.status === 429) {
        console.error(`${name}: quota exhausted, stopping run — will resume next scheduled run.`);
        quotaHit = true;
        break;
      }
      console.error(`${name}: FAILED — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  saveProgress(progress);
  console.log(JSON.stringify({ newIcpMatches, quotaHit, remaining: toTry.length - newIcpMatches.length }, null, 2));
}

main();
