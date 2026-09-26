"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brand, DecisionMaker, MenuItem, getBrandDetail, markProcessed } from "@/lib/supabase";
import { initials, logoColor } from "@/lib/logo";

const WA_ICON =
  "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.36 4.98L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.1 8.1 0 0 1-4.14-1.13l-.3-.18-3.11.82.83-3.03-.19-.31a8.08 8.08 0 0 1-1.24-4.28c0-4.47 3.64-8.1 8.15-8.1a8.1 8.1 0 0 1 8.11 8.12c0 4.47-3.64 8.09-8.1 8.09z";

const LI_ICON =
  "M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-3.96 4.77 0V21H22v-7.93c0-6.17-6.98-5.95-8.68-2.91V8.48z";

function maskPhone(phone: string | null): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return phone;
  return `[Sample] +${digits.slice(0, 2)} ${digits.slice(2, 4)}••• •••${digits.slice(-2)}`;
}

export function BrandDialog({
  brandId,
  onClose,
  onProcessed,
}: {
  brandId: string | null;
  onClose: () => void;
  onProcessed: () => void;
}) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [decisionMakers, setDecisionMakers] = useState<DecisionMaker[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!brandId) return;
    let cancelled = false;
    setLoading(true);
    getBrandDetail(brandId).then((detail) => {
      if (cancelled) return;
      setBrand(detail.brand);
      setDecisionMakers(detail.decisionMakers);
      setMenuItems(detail.menuItems);
      setNotes("");
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [brandId]);

  async function handleMarkProcessed() {
    if (!brandId) return;
    setSubmitting(true);
    try {
      await markProcessed(brandId, "contacted", notes);
      onProcessed();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {brandId && (
        <motion.div
          key="dialog-scrim"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(28,20,12,0.55)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            key="dialog-modal"
            className="flex max-h-[85vh] w-[900px] max-w-[95vw] flex-col overflow-hidden rounded-[18px]"
            style={{ background: "var(--surface)", boxShadow: "0 30px 60px -20px rgba(20,12,4,0.45)" }}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
        {loading || !brand ? (
          <div className="p-10 text-sm" style={{ color: "var(--ink-soft)" }}>
            Loading…
          </div>
        ) : (
          <>
            <div
              className="flex items-start justify-between px-7.5 pt-6.5 pb-5"
              style={{ borderBottom: "1px solid var(--line)", padding: "26px 30px 20px" }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-13 w-13 items-center justify-center rounded-xl font-bold text-white"
                  style={{ width: 52, height: 52, background: logoColor(brand.name), fontFamily: "var(--font-sora)", fontSize: 18 }}
                >
                  {initials(brand.name)}
                </div>
                <div>
                  <div className="text-[20px] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
                    {brand.name}
                  </div>
                  <div className="mt-1.5 flex gap-2">
                    {(brand.category ?? "").split(" · ").map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ color: "var(--ink-soft)", background: "#f2ece2" }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ color: "var(--ink-soft)", background: "#f2ece2" }}
                    >
                      {brand.cities.join(" · ")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg"
                style={{ color: "var(--ink-soft)", border: "1px solid var(--line)" }}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-3.5 w-3.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid flex-1 grid-cols-2 overflow-auto">
              <div className="p-6" style={{ padding: "24px 30px" }}>
                <SectionLabel>Account snapshot</SectionLabel>
                <div className="mb-5.5 grid grid-cols-2 gap-3" style={{ marginBottom: 22 }}>
                  <Stat val={String(brand.outlet_count)} label="Total outlets" />
                  <Stat val={brand.pos_vendor ?? "Unknown"} label="Current POS" />
                  <Stat val={`${brand.cities.length} ${brand.cities.length === 1 ? "city" : "cities"}`} label={brand.cities.join(", ")} />
                  <Stat val={String(brand.first_seen_at ? new Date(brand.first_seen_at).getFullYear() : "—")} label="First seen" />
                </div>

                <SectionLabel>Decision makers</SectionLabel>
                {decisionMakers.length === 0 && (
                  <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                    No decision-makers on file yet.
                  </div>
                )}
                {decisionMakers.map((dm) => (
                  <div
                    key={dm.id}
                    className="mb-3 flex flex-col gap-2.5 rounded-xl p-3.5"
                    style={{ border: "1px solid var(--line)", padding: "14px 16px" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
                        style={{ width: 38, height: 38, background: logoColor(dm.name), fontFamily: "var(--font-sora)" }}
                      >
                        {initials(dm.name)}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold">{dm.name}</div>
                        <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                          {dm.title}
                        </div>
                      </div>
                      <div className="ml-auto flex gap-2">
                        {dm.whatsapp_number && (
                          <a
                            href={`https://wa.me/${dm.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Hi ${dm.name.split(" ")[0]}, reaching out from Outreach Radar re: ${brand.name}'s POS/ordering setup — got 2 minutes this week?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "var(--good-tint)", color: "var(--whatsapp)" }}
                            aria-label="WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px]">
                              <path d={WA_ICON} />
                            </svg>
                          </a>
                        )}
                        {dm.linkedin_url && (
                          <a
                            href={dm.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: "#eaf1fb", color: "#2867b2" }}
                            aria-label="LinkedIn"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-[15px] w-[15px]">
                              <path d={LI_ICON} />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                      {maskPhone(dm.phone)}
                      {dm.email ? ` · ${dm.email}` : ""}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6" style={{ padding: "24px 30px", borderLeft: "1px solid var(--line)" }}>
                <SectionLabel>Menu &amp; pricing (sample extract)</SectionLabel>
                <table className="w-full text-[13px]" style={{ borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <th
                        className="pb-2 text-left text-[11px] font-semibold uppercase"
                        style={{ color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}
                      >
                        Item
                      </th>
                      <th
                        className="pb-2 text-right text-[11px] font-semibold uppercase"
                        style={{ color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}
                      >
                        Price
                      </th>
                    </tr>
                    {menuItems.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-3 text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
                          No menu data synced yet.
                        </td>
                      </tr>
                    )}
                    {menuItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
                          {item.name}
                        </td>
                        <td className="py-2.5 text-right font-semibold" style={{ borderBottom: "1px solid var(--line)" }}>
                          {item.price != null ? `₹${item.price}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {menuItems.length > 0 && (
                  <div className="mt-2.5 text-[11.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                    Pulled from public delivery-platform listings.
                  </div>
                )}

                <div className="mt-5">
                  <SectionLabel>Notes</SectionLabel>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note for this account before marking it processed…"
                    className="h-16 w-full rounded-[10px] p-2.5 text-[12.5px]"
                    style={{ border: "1px solid var(--line)", fontFamily: "inherit", color: "var(--ink)" }}
                  />
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 px-7.5 py-4.5"
              style={{ padding: "18px 30px", borderTop: "1px solid var(--line)", background: "#faf6f0" }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex items-center gap-2 rounded-[9px] px-4.5 py-2.5 text-[13.5px] font-semibold"
                style={{ border: "1px solid var(--line)", color: "var(--ink-soft)", padding: "11px 18px" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-[15px] w-[15px]">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                Skip for now
              </motion.button>
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                onClick={handleMarkProcessed}
                disabled={submitting}
                className="ml-auto flex items-center gap-2 rounded-[9px] px-4.5 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60"
                style={{ background: "var(--good)", padding: "11px 18px" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-[15px] w-[15px]">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {submitting ? "Saving…" : "Mark as processed"}
              </motion.button>
            </div>
          </>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-3 text-[11px] font-bold uppercase"
      style={{ letterSpacing: "0.05em", color: "var(--ink-soft)" }}
    >
      {children}
    </div>
  );
}

function Stat({ val, label }: { val: string; label: string }) {
  return (
    <div className="rounded-[11px] p-3" style={{ background: "#faf6f0", border: "1px solid var(--line)", padding: "12px 14px" }}>
      <div className="text-[18px] font-bold" style={{ fontFamily: "var(--font-sora)" }}>
        {val}
      </div>
      <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
        {label}
      </div>
    </div>
  );
}
