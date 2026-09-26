"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { ProcessedRow, getProcessed, getCounts } from "@/lib/supabase";
import { initials, logoColor } from "@/lib/logo";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

function pillStyle(outcome: string): { className: string; bg: string; color: string } {
  const o = outcome.toLowerCase();
  if (o.includes("meeting") || o.includes("won")) {
    return { className: "won", bg: "var(--good-tint)", color: "var(--good)" };
  }
  if (o.includes("not interested") || o.includes("duplicate") || o.includes("closed")) {
    return { className: "closed", bg: "var(--mute-tint)", color: "var(--mute)" };
  }
  return { className: "pending", bg: "var(--warn-tint)", color: "oklch(48% 0.13 75)" };
}

function outcomeLabel(outcome: string): string {
  if (outcome === "contacted") return "Contacted · awaiting reply";
  return outcome.charAt(0).toUpperCase() + outcome.slice(1);
}

export default function ProcessedPage() {
  const [rows, setRows] = useState<ProcessedRow[]>([]);
  const [counts, setCounts] = useState({ newCount: 0, processedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([getProcessed(), getCounts()]).then(([r, c]) => {
      setRows(r);
      setCounts(c);
      setLoading(false);
    });
  }, []);

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return r.brand?.name.toLowerCase().includes(q) || r.brand?.cities.some((c) => c.toLowerCase().includes(q));
  });

  function exportCsv() {
    const header = ["Brand", "Outlets", "Processed on", "Outcome", "SDR", "Notes"];
    const lines = filtered.map((r) => [
      r.brand?.name ?? "",
      String(r.brand?.outlet_count ?? ""),
      new Date(r.processed_at).toLocaleDateString(),
      outcomeLabel(r.outcome),
      r.sdr?.name ?? "",
      (r.notes ?? "").replace(/"/g, '""'),
    ]);
    const csv = [header, ...lines].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed-brands.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar active="processed" newCount={counts.newCount} processedCount={counts.processedCount} />

      <div className="flex flex-1 flex-col gap-5.5 p-9" style={{ padding: "36px 44px", gap: 22 }}>
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
              Account history
            </div>
            <div className="text-[26px] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
              Processed brands
            </div>
            <div className="mt-1.5 max-w-[520px] text-[14px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Every brand you&apos;ve reviewed — excluded from future daily matches automatically.
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportCsv}
            className="flex h-fit items-center gap-2 rounded-[9px] px-4 py-2.5 text-[13px] font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "10px 16px" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[15px] w-[15px]">
              <path d="M12 3v13m0 0-4-4m4 4 4-4M4 21h16" />
            </svg>
            Export CSV
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
              placeholder="Search processed brands…"
              className="w-full bg-transparent text-[13px] outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            All time
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            All outcomes
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
              gridTemplateColumns: "1.9fr 1fr 1.2fr 1fr 1fr 0.7fr",
              letterSpacing: "0.04em",
              color: "var(--ink-soft)",
              borderBottom: "1px solid var(--line)",
              padding: "13px 22px",
            }}
          >
            <div>Brand</div>
            <div>Outlets</div>
            <div>Processed on</div>
            <div>Outcome</div>
            <div>Assigned SDR</div>
            <div />
          </div>

          {loading && (
            <div className="p-8 text-[13px]" style={{ color: "var(--ink-soft)" }}>
              Loading…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="p-8 text-[13px]" style={{ color: "var(--ink-soft)" }}>
              Nothing processed yet — mark a brand from the New Brands queue.
            </div>
          )}

          {!loading && (
            <motion.div variants={listVariants} initial="hidden" animate="show">
              {filtered.map((row) => {
              const pill = pillStyle(row.outcome);
              return (
                <motion.div
                  key={row.id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "#faf6f0" }}
                  className="grid items-center gap-3 px-5.5 py-3.5"
                  style={{
                    gridTemplateColumns: "1.9fr 1fr 1.2fr 1fr 1fr 0.7fr",
                    borderBottom: "1px solid var(--line)",
                    padding: "14px 22px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-[9px] text-[13px] font-bold text-white"
                      style={{ width: 38, height: 38, background: logoColor(row.brand?.name ?? ""), fontFamily: "var(--font-sora)" }}
                    >
                      {initials(row.brand?.name ?? "?")}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold">{row.brand?.name}</div>
                      <div className="mt-0.5 text-[12px]" style={{ color: "var(--ink-soft)" }}>
                        {row.brand?.cities.join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px]">{row.brand?.outlet_count} outlets</div>
                  <div className="text-[13px]">{new Date(row.processed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                  <div
                    className="flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                    style={{ background: pill.bg, color: pill.color }}
                  >
                    <svg viewBox="0 0 8 8" fill="currentColor" className="h-2 w-2">
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                    {outcomeLabel(row.outcome)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                    <div
                      className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: "var(--sidebar-line)", color: "#e9dfd2" }}
                    >
                      {initials(row.sdr?.name ?? "?")}
                    </div>
                    {row.sdr?.name ?? "Unassigned"}
                  </div>
                  <div />
                </motion.div>
              );
              })}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
