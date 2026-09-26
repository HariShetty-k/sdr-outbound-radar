"use client";

import { AnimatePresence, motion } from "motion/react";

export type BrandFilters = {
  cities: string[];
  posVendors: string[];
};

export function FilterDrawer({
  open,
  onClose,
  allCities,
  allPosVendors,
  filters,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  allCities: string[];
  allPosVendors: string[];
  filters: BrandFilters;
  onChange: (filters: BrandFilters) => void;
}) {
  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-scrim"
            className="fixed inset-0 z-40"
            style={{ background: "rgba(28,20,12,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="drawer-panel"
            className="fixed right-0 top-0 z-50 flex h-full w-[360px] max-w-[90vw] flex-col"
            style={{ background: "var(--surface)", boxShadow: "-20px 0 40px -20px rgba(20,12,4,0.35)" }}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div className="text-[16px] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
                Filters
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
                aria-label="Close filters"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-3.5 w-3.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              <div
                className="mb-3 text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.05em", color: "var(--ink-soft)" }}
              >
                City
              </div>
              <div className="mb-6 flex flex-wrap gap-2">
                {allCities.map((city) => {
                  const on = filters.cities.includes(city);
                  return (
                    <motion.button
                      key={city}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onChange({ ...filters, cities: toggle(filters.cities, city) })}
                      className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                      style={
                        on
                          ? { background: "var(--accent-tint)", border: "1px solid var(--accent)", color: "var(--accent-hover)" }
                          : { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }
                      }
                    >
                      {city}
                    </motion.button>
                  );
                })}
              </div>

              <div
                className="mb-3 text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.05em", color: "var(--ink-soft)" }}
              >
                Current POS
              </div>
              <div className="flex flex-wrap gap-2">
                {allPosVendors.map((pos) => {
                  const on = filters.posVendors.includes(pos);
                  return (
                    <motion.button
                      key={pos}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onChange({ ...filters, posVendors: toggle(filters.posVendors, pos) })}
                      className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                      style={
                        on
                          ? { background: "var(--accent-tint)", border: "1px solid var(--accent)", color: "var(--accent-hover)" }
                          : { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)" }
                      }
                    >
                      {pos}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--line)", background: "#faf6f0" }}>
              <button
                onClick={() => onChange({ cities: [], posVendors: [] })}
                className="text-[12.5px] font-semibold"
                style={{ color: "var(--ink-soft)" }}
              >
                Clear all
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="ml-auto rounded-[9px] px-4 py-2.5 text-[13px] font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Apply
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
