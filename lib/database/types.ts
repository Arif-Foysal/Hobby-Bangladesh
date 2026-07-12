export type UserRole = "customer" | "admin";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  sort_order?: number;
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductFeature {
  icon: string;
  title: string;
  text: string;
}

export interface LandingPageContent {
  hero_subtitle?: string;
  hero_image_url?: string;
  faq_items?: { question: string; answer: string }[];
  landing_description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_desc: string | null;
  price: number;
  compare_at: number | null;
  cost_price: number | null;
  sku: string | null;
  stock_qty: number;
  is_active: boolean;
  category_id: string | null;
  images: ProductImage[];
  attributes: Record<string, string[]>;
  features: ProductFeature[];
  landing_page_enabled: boolean;
  landing_page_sections: LandingPageContent;
  rating_avg: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
}

export interface CartWithProduct extends Cart {
  product: Pick<Product, "id" | "name" | "slug" | "price" | "compare_at" | "images" | "stock_qty" | "is_active">;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  division: string;
  city: string;
  area: string;
  address: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_address: ShippingAddress;
  payment_method: string;
  payment_status: PaymentStatus;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  name: string;
  phone: string;
  division: string;
  city: string;
  area: string;
  address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface StoreCurrency {
  code: string;
  symbol: string;
  position: "before" | "after";
}

export interface StoreTax {
  rate: number;
  label: string;
}

export interface StoreShipping {
  inside_dhaka: number;
  outside_dhaka: number;
  free_shipping_min: number;
}

export interface StoreInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface HeroSlide {
  image_url: string;
  title?: string;
  link?: string;
  show_title?: boolean;
  show_button?: boolean;
}

export interface HeroSlidesConfig {
  slides: HeroSlide[];
}

export interface StoreSetting {
  id: string;
  key: string;
  value: StoreCurrency | StoreTax | StoreShipping | StoreInfo | HeroSlidesConfig;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
