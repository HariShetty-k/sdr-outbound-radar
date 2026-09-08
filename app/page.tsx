"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { BrandDialog } from "@/components/BrandDialog";
import { Brand, getNewBrands, getCounts } from "@/lib/supabase";
import { initials, logoColor } from "@/lib/logo";

export default function NewBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [counts, setCounts] = useState({ newCount: 0, processedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const [newBrands, c] = await Promise.all([getNewBrands(), getCounts()]);
    setBrands(newBrands);
    setCounts(c);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = brands.filter((b) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || b.cities.some((c) => c.toLowerCase().includes(q));
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="flex min-h-screen">
      <Sidebar active="new" newCount={counts.newCount} processedCount={counts.processedCount} />

      <div className="flex flex-1 flex-col gap-6 p-9" style={{ padding: "36px 44px" }}>
        <div className="flex items-start justify-between">
          <div>
            <div
              className="mb-1.5 text-[12px] font-semibold uppercase"
              style={{ letterSpacing: "0.05em", color: "var(--accent-hover)" }}
            >
              {today} · Today's queue
            </div>
            <div className="text-[26px] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
              {brands.length} new brand{brands.length === 1 ? "" : "s"} to speak to
            </div>
            <div className="mt-1.5 max-w-[520px] text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Auto-matched against your ICP — 5+ outlets, any Indian city — and filtered against{" "}
              {counts.processedCount} brand{counts.processedCount === 1 ? "" : "s"} already processed.
            </div>
          </div>
          <button
            onClick={refresh}
            className="flex h-fit items-center gap-2 rounded-[9px] px-4 py-2.5 text-[13px] font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 16px" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Refresh matches
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className="flex max-w-[340px] flex-1 items-center gap-2.5 rounded-[9px] px-3.5 py-2.5"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-none" style={{ color: "var(--ink-soft)" }}>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brand or city…"
              className="w-full bg-transparent text-[13px] outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <Chip on>5+ outlets</Chip>
          <Chip>All cities</Chip>
          <Chip>Any POS</Chip>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--ink-soft)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5" style={{ color: "var(--good)" }}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            ICP filter &amp; dedup applied automatically
          </div>
        </div>

        <div
          className="flex flex-1 flex-col overflow-hidden rounded-[14px]"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div
            className="grid gap-3 px-5.5 py-3.5 text-[11px] font-semibold uppercase"
            style={{
              gridTemplateColumns: "1.9fr 1fr 1.1fr 1fr 0.7fr 90px",
              letterSpacing: "0.04em",
              color: "var(--ink-soft)",
              borderBottom: "1px solid var(--line)",
              padding: "13px 22px",
            }}
          >
            <div>Brand</div>
            <div>Outlets</div>
            <div>Cities</div>
            <div>Current POS</div>
            <div>Status</div>
            <div />
          </div>

          {loading && (
            <div className="p-8 text-[13px]" style={{ color: "var(--ink-soft)" }}>
              Loading…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="p-8 text-[13px]" style={{ color: "var(--ink-soft)" }}>
              No brands match your search.
            </div>
          )}

          {!loading &&
            filtered.map((brand) => (
              <div
                key={brand.id}
                onClick={() => setSelectedBrandId(brand.id)}
                className="grid cursor-pointer items-center gap-3 px-5.5 py-3.5"
                style={{
                  gridTemplateColumns: "1.9fr 1fr 1.1fr 1fr 0.7fr 90px",
                  borderBottom: "1px solid var(--line)",
                  padding: "14px 22px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-[9px] text-[13px] font-bold text-white"
                    style={{ width: 38, height: 38, background: logoColor(brand.name), fontFamily: "var(--font-sora)" }}
                  >
                    {initials(brand.name)}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold">{brand.name}</div>
                    <div className="mt-0.5 text-[12px]" style={{ color: "var(--ink-soft)" }}>
                      {brand.category}
                    </div>
                  </div>
                </div>
                <div className="text-[13px]">{brand.outlet_count} outlets</div>
                <div className="text-[13px]">{brand.cities.join(", ")}</div>
                <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                  {brand.pos_vendor ?? "Unknown"}
                </div>
                <div
                  className="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: "var(--accent-tint)", color: "var(--accent-hover)" }}
                >
                  <svg viewBox="0 0 8 8" fill="currentColor" className="h-2 w-2">
                    <circle cx="4" cy="4" r="4" />
                  </svg>
                  New
                </div>
                <div className="flex items-center justify-self-end gap-1 text-[12.5px] font-semibold" style={{ color: "var(--accent-hover)" }}>
                  View
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            ))}
        </div>
      </div>

      {selectedBrandId && (
        <BrandDialog
          brandId={selectedBrandId}
          onClose={() => setSelectedBrandId(null)}
          onProcessed={() => {
            setSelectedBrandId(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Chip({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium"
      style={
        on
          ? { background: "var(--accent-tint)", border: "1px solid var(--accent)", color: "var(--accent-hover)" }
          : { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }
      }
    >
      {on && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-[13px] w-[13px]">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      {children}
    </div>
  );
}
