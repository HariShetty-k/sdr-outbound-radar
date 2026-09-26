"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { BrandDialog } from "@/components/BrandDialog";
import { FilterDrawer, BrandFilters } from "@/components/FilterDrawer";
import { Brand, getNewBrands, getCounts } from "@/lib/supabase";
import { initials, logoColor } from "@/lib/logo";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function NewBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [counts, setCounts] = useState({ newCount: 0, processedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<BrandFilters>({ cities: [], posVendors: [] });

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

  const allCities = useMemo(
    () => Array.from(new Set(brands.flatMap((b) => b.cities))).sort(),
    [brands]
  );
  const allPosVendors = useMemo(
    () => Array.from(new Set(brands.map((b) => b.pos_vendor ?? "Unknown"))).sort(),
    [brands]
  );

  const filtered = brands.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || b.name.toLowerCase().includes(q) || b.cities.some((c) => c.toLowerCase().includes(q));
    const matchesCity = filters.cities.length === 0 || b.cities.some((c) => filters.cities.includes(c));
    const matchesPos = filters.posVendors.length === 0 || filters.posVendors.includes(b.pos_vendor ?? "Unknown");
    return matchesQuery && matchesCity && matchesPos;
  });

  const activeFilterCount = filters.cities.length + filters.posVendors.length;
  const today = new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="flex min-h-screen">
      <Sidebar active="new" newCount={counts.newCount} processedCount={counts.processedCount} />

      <div className="flex flex-1 flex-col gap-6 p-9" style={{ padding: "36px 44px" }}>
        <motion.div
          className="flex items-start justify-between"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div>
            <div
              className="mb-1.5 text-[12px] font-semibold uppercase"
              style={{ letterSpacing: "0.05em", color: "var(--accent-hover)" }}
            >
              {today} · Today's queue
            </div>
            <div className="text-[26px] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
              {filtered.length} new brand{filtered.length === 1 ? "" : "s"} to speak to
            </div>
            <div className="mt-1.5 max-w-[520px] text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Auto-matched against your ICP — 5+ outlets, any Indian city — and filtered against{" "}
              {counts.processedCount} brand{counts.processedCount === 1 ? "" : "s"} already processed.
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refresh}
            className="flex h-fit items-center gap-2 rounded-[9px] px-4 py-2.5 text-[13px] font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 16px" }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-[15px] w-[15px]"
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </motion.svg>
            Refresh matches
          </motion.button>
        </motion.div>

        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        >
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
          <Chip onClick={() => setDrawerOpen(true)} on={filters.cities.length > 0}>
            {filters.cities.length > 0 ? `${filters.cities.length} cit${filters.cities.length === 1 ? "y" : "ies"}` : "All cities"}
          </Chip>
          <Chip onClick={() => setDrawerOpen(true)} on={filters.posVendors.length > 0}>
            {filters.posVendors.length > 0 ? `${filters.posVendors.length} POS` : "Any POS"}
          </Chip>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({ cities: [], posVendors: [] })}
              className="text-[12px] font-medium"
              style={{ color: "var(--ink-soft)" }}
            >
              Clear
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--ink-soft)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5" style={{ color: "var(--good)" }}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            ICP filter &amp; dedup applied automatically
          </div>
        </motion.div>

        <motion.div
          className="flex flex-1 flex-col overflow-hidden rounded-[14px]"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
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
              No brands match your filters.
            </div>
          )}

          {!loading && (
            <motion.div variants={listVariants} initial="hidden" animate="show">
              {filtered.map((brand) => (
                <motion.div
                  key={brand.id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "#faf6f0" }}
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <BrandDialog
        brandId={selectedBrandId}
        onClose={() => setSelectedBrandId(null)}
        onProcessed={() => {
          setSelectedBrandId(null);
          refresh();
        }}
      />

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        allCities={allCities}
        allPosVendors={allPosVendors}
        filters={filters}
        onChange={setFilters}
      />
    </div>
  );
}

function Chip({
  children,
  on,
  onClick,
}: {
  children: React.ReactNode;
  on?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={onClick ? { scale: 1.03 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
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
    </motion.button>
  );
}
