import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DecisionMaker = {
  id: string;
  brand_id: string;
  name: string;
  title: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  linkedin_url: string | null;
  email: string | null;
};

export type MenuItem = {
  id: string;
  brand_id: string;
  name: string;
  price: number | null;
  source: string | null;
  last_synced_at: string | null;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  cities: string[];
  outlet_count: number;
  pos_vendor: string | null;
  icp_match: boolean;
  first_seen_at: string;
};

export type ProcessedLog = {
  id: string;
  brand_id: string;
  sdr_id: string | null;
  processed_at: string;
  outcome: string;
  notes: string | null;
};

export type ProcessedRow = ProcessedLog & {
  brand: Brand;
  sdr: { id: string; name: string; role: string | null } | null;
};

/** Brands not yet in processed_log, most recently seen first, capped at 10 (Day 1 daily queue). */
export async function getNewBrands(): Promise<Brand[]> {
  const { data: processed, error: processedError } = await supabase
    .from("processed_log")
    .select("brand_id");
  if (processedError) throw processedError;

  const processedIds = (processed ?? []).map((p) => p.brand_id);

  let query = supabase
    .from("brand")
    .select("*")
    .order("first_seen_at", { ascending: false })
    .limit(10);

  if (processedIds.length > 0) {
    query = query.not("id", "in", `(${processedIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBrandDetail(id: string): Promise<{
  brand: Brand;
  decisionMakers: DecisionMaker[];
  menuItems: MenuItem[];
}> {
  const [{ data: brand, error: brandError }, { data: decisionMakers, error: dmError }, { data: menuItems, error: menuError }] =
    await Promise.all([
      supabase.from("brand").select("*").eq("id", id).single(),
      supabase.from("decision_maker").select("*").eq("brand_id", id),
      supabase.from("menu_item").select("*").eq("brand_id", id),
    ]);

  if (brandError) throw brandError;
  if (dmError) throw dmError;
  if (menuError) throw menuError;

  return {
    brand: brand as Brand,
    decisionMakers: decisionMakers ?? [],
    menuItems: menuItems ?? [],
  };
}

export async function getProcessed(): Promise<ProcessedRow[]> {
  const { data, error } = await supabase
    .from("processed_log")
    .select("*, brand:brand_id(*), sdr:sdr_id(id, name, role)")
    .order("processed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProcessedRow[];
}

export async function markProcessed(
  brandId: string,
  outcome: string,
  notes: string
): Promise<void> {
  // Day 1 has a single seeded SDR — attach their id so processed rows show an assignee.
  const { data: sdr } = await supabase.from("sdr_user").select("id").limit(1).single();

  const { error } = await supabase.from("processed_log").insert({
    brand_id: brandId,
    sdr_id: sdr?.id ?? null,
    outcome,
    notes: notes || null,
  });
  if (error) throw error;
}

export async function getCounts(): Promise<{ newCount: number; processedCount: number }> {
  const [{ count: processedCount }, newBrands] = await Promise.all([
    supabase.from("processed_log").select("*", { count: "exact", head: true }),
    getNewBrands(),
  ]);
  return { newCount: newBrands.length, processedCount: processedCount ?? 0 };
}
