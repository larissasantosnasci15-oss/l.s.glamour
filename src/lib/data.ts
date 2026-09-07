import { createClient } from "./supabase/server";
import { DEFAULT_SETTINGS, type Banner, type Category, type Product, type Settings } from "./types";

export async function getSettings(): Promise<Settings> {
  const supabase = createClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getBanners(): Promise<Banner[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getAllBannersAdmin(): Promise<Banner[]> {
  const supabase = createClient();
  const { data } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  return data ?? [];
}

type ProductFilters = {
  categorySlug?: string;
  search?: string;
  onlyPromo?: boolean;
  onlyLaunch?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*, categories(*)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
    else return [];
  }
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
    );
  }
  if (filters.onlyPromo) query = query.eq("is_promo", true);
  if (filters.onlyLaunch) query = query.eq("is_launch", true);
  if (typeof filters.minPrice === "number") query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") query = query.lte("price", filters.maxPrice);
  if (filters.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return (data as Product) ?? null;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}
