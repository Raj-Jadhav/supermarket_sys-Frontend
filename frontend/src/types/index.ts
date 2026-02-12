// ===== Auth =====
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  assigned_store: number | null;
  roles: Role[];
  date_joined: string;
}

export interface Role {
  id: number;
  role: 'admin' | 'staff' | 'customer';
  store: number | null;
  store_name: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// ===== Store =====
export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  manager: number | null;
  manager_name: string | null;
  aisle_count: number;
  is_active: boolean;
}

export interface Aisle {
  id: number;
  store: number;
  number: number;
  name: string;
  allowed_categories: number[];
  allowed_category_names: string[];
  stock_count: number;
}

// ===== Products =====
export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  parent: number | null;
  product_count: number;
}

export interface NutrientType {
  id: number;
  name: string;
  category: string;
  category_display: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
  categories: number[];
  category_names: string[];
  nutrients: number[];
  nutrient_names: string[];
  shelf_life_days: number;
  image: string;
  is_active: boolean;
}

// ===== Inventory =====
export interface StockItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  aisle: number;
  aisle_number: number;
  aisle_name: string;
  store_name: string;
  quantity: number;
  expiry_date: string;
  expiry_status: 'safe' | 'expiring' | 'expired';
  days_until_expiry: number;
  batch_number: string;
  stocked_date: string;
}

// ===== Search =====
export interface SearchResult {
  product: {
    id: number;
    name: string;
    price: string;
    categories: string[];
    nutrients: string[];
  };
  locations: {
    aisle_number: number;
    aisle_name: string;
    quantity: number;
    message: string;
  }[];
  total_quantity: number;
}

export interface SearchResponse {
  query: string;
  search_type: string;
  results_count: number;
  results: SearchResult[];
}

// ===== Dashboard =====
export interface StockAlert {
  id: number;
  product: string;
  aisle: string;
  quantity: number;
  days_left?: number;
  expiry_date?: string;
  expired_days?: number;
}

export interface DashboardData {
  stock_alerts: {
    expiring_soon: { count: number; items: StockAlert[] };
    expired: { count: number; items: StockAlert[] };
    low_stock: { count: number; items: StockAlert[] };
  };
  aisle_overview: {
    number: number;
    name: string;
    product_count: number;
    total_items: number;
  }[];
  popular_products: { search_query: string; count: number }[];
  popular_nutrients: { search_query: string; count: number }[];
  unfulfilled_searches: { search_query: string; search_type: string; count: number }[];
}