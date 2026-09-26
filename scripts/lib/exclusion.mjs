import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCLUSION_FILE = join(__dirname, "..", "data", "excluded-brands.txt");

// Only truly generic filler words — never a word that could distinguish one brand from
// another (e.g. "kitchen", "grill", "cafe" all carry real meaning in a restaurant name).
const STOPWORDS = new Set(["india", "pvt", "ltd", "llp", "the", "and"]);

/** Returns normalized word tokens (not a joined string) — matching must compare token sets, not raw substrings, so a short token like "rba" can't accidentally match inside an unrelated word like "parbat". */
export function normalizeTokens(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .sort();
}

export function normalize(name) {
  return normalizeTokens(name).join(" ");
}

// Splits combined cells like "Ovenstrory Pizza /Fasoos /Wendy's India (Rebel foods)"
// into individual candidate names, since one exclusion-list entry can name several brands
// plus their shared parent company in parentheses.
function splitEntry(raw) {
  const parenMatch = raw.match(/\(([^)]+)\)/);
  const parent = parenMatch ? parenMatch[1].trim() : null;
  const withoutParen = raw.replace(/\([^)]*\)/g, "");
  const parts = withoutParen.split("/").map((p) => p.trim()).filter(Boolean);
  return parent ? [...parts, parent] : parts;
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** Loads and flattens the excluded-brands.txt lookup into normalized candidate strings. */
export function loadExclusionSet() {
  const raw = readFileSync(EXCLUSION_FILE, "utf8");
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const flattened = lines.flatMap(splitEntry);
  return flattened.map((name) => ({ original: name, norm: normalize(name) }));
}

/** True if every token in `shorter` appears verbatim in `longer` — a whole-word subset check, never a raw substring check, so short tokens can't match by accident inside unrelated words. */
function isTokenSubset(shorter, longer) {
  const longerSet = new Set(longer);
  return shorter.length > 0 && shorter.every((tok) => longerSet.has(tok));
}

/**
 * Returns the matching exclusion-list entry if `name` is already known, else null.
 * Matches on whole-word token-subset containment, or close edit-distance between the
 * full normalized names (typo tolerance for things like "Absolute Barbeque" vs
 * "Absolute Barbecues") — never a raw substring check, which is unsafe for short names.
 */
export function findExclusionMatch(name, exclusionSet) {
  const nTokens = normalizeTokens(name);
  const n = nTokens.join(" ");
  if (!n) return null;
  for (const entry of exclusionSet) {
    if (!entry.norm) continue;
    const entryTokens = entry.norm.split(" ");
    if (isTokenSubset(nTokens, entryTokens) || isTokenSubset(entryTokens, nTokens)) {
      return entry.original;
    }
    // Both names must already be reasonably long before trusting edit-distance — a short
    // name (e.g. 3-4 letters) is too easy to accidentally land within 2 edits of an
    // unrelated short name. Token-subset above (not this) is what catches the real
    // substring cases like "RBA" safely, since it requires a whole-word match.
    const maxLen = Math.max(entry.norm.length, n.length);
    const minLen = Math.min(entry.norm.length, n.length);
    if (maxLen > 4 && minLen > 4 && levenshtein(entry.norm, n) <= 2) return entry.original;
  }
  return null;
}
