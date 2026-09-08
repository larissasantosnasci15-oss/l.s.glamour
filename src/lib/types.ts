export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand: string | null;
  description: string;
  price: number;
  promo_price: number | null;
  stock: number;
  active: boolean;
  is_promo: boolean;
  is_launch: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  image_url: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
  categories?: Category | null;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type Settings = {
  id: number;
  store_name: string;
  slogan: string;
  description: string;
  logo_url: string | null;
  favicon_url: string | null;
  whatsapp_number: string;
  instagram: string;
  tiktok: string;
  email: string;
  address: string;
  hours: string;
  payment_info: string;
  shipping_info: string;
  exchange_policy: string;
  privacy_policy: string;
  primary_color: string;
  secondary_color: string;
  button_color: string;
  font_choice: string;
};

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  store_name: "L.S.Glamour",
  slogan: "Sua beleza, seu estilo, seu glamour.",
  description: "",
  logo_url: null,
  favicon_url: null,
  whatsapp_number: "",
  instagram: "",
  tiktok: "",
  email: "",
  address: "",
  hours: "",
  payment_info: "",
  shipping_info: "",
  exchange_policy: "",
  privacy_policy: "",
  primary_color: "#221E1F",
  secondary_color: "#FBD7E6",
  button_color: "#221E1F",
  font_choice: "glamour",
};

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
};
