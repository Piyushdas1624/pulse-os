export type TableStatus =
  | "available"
  | "occupied"
  | "ordering"
  | "kitchen_cooking"
  | "served"
  | "needs_cleaning";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export type AIBudgetMode = "economy" | "balanced" | "performance";
export type AIProviderMode = "demo" | "personal" | "env";
export type AIProviderType = "gemini" | "openai" | "anthropic" | "openrouter";

export interface GeminiModelInfo {
  name: string;
  displayName: string;
  description?: string;
  isRecommended: boolean;
  maxTokens: number;
  speedRating: number; // 1-5
  costRating: number; // 1-5
  qualityRating: number; // 1-5
  badgeLabel?: string;
  supportedCapabilities: string[];
}

export interface Table {
  id: string;
  table_number: number;
  capacity: number;
  status: TableStatus;
  x_pos: number;
  y_pos: number;
  active_order_id?: string;
  bill_amount: number;
  seated_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: "starters" | "mains" | "desserts" | "beverages";
  price: number;
  prep_time_mins: number;
  is_available: boolean;
  stock_qty: number;
  description: string;
  ingredients: string[];
  recommended_with?: string;
  image_url?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  qty: number;
  status: OrderStatus;
  special_instructions?: string;
}

export interface Order {
  id: string;
  table_id: string;
  table_number: number;
  customer_name: string;
  status: OrderStatus;
  total_amount: number;
  wait_time_est: number;
  created_at: string;
  items: OrderItem[];
}

export interface InventoryItem {
  id: string;
  name: string;
  current_stock: number;
  min_threshold: number;
  unit: string;
  unit_cost: number;
  est_runout_mins: number;
  potential_loss: number;
}

export interface KitchenTicket {
  id: string;
  order_id: string;
  dish_name: string;
  qty: number;
  table_numbers: number[];
  status: "pending" | "cooking" | "ready";
  station: "Station A (Grill)" | "Station B (Saute)" | "Station C (Assembly)";
  prep_priority: "normal" | "high" | "batched";
  created_at: string;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  type: "order" | "kitchen" | "inventory" | "table" | "ai";
  description: string;
  severity: "info" | "warning" | "success" | "danger";
  table_number?: number;
}

export interface AIInsight {
  id: string;
  type: "bottleneck" | "inventory" | "forecast" | "advisor";
  title: string;
  problem: string;
  cause: string;
  recommendation: string;
  business_impact: {
    wait_reduction_pct: number;
    revenue_increase_val: number;
    waste_reduction_pct: number;
    kitchen_load_reduction_pct: number;
  };
  confidence: number;
  reasoning: string[];
  why_not?: string[];
  snapshot_version: string;
  generated_ago_sec: number;
  created_at: string;
}

export interface AIMemoryItem {
  id: string;
  timestamp: string;
  title: string;
  action_taken: string;
  outcome_metric: string;
  delta_pct: number;
}

export interface GovernorState {
  provider_type: AIProviderType;
  provider_mode: AIProviderMode;
  personal_api_key?: string;
  selected_model: string;
  budget_mode: AIBudgetMode;
  today_budget_inr: number;
  budget_used_inr: number;
  ai_requests_count: number;
  cache_hit_count: number;
  tokens_saved_pct: number;
  avg_latency_ms: number;
  is_offline_fallback: boolean;
  today_ai_cost_inr: number;
  without_governor_cost_inr: number;
  last_scan_time?: string;
  health_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH";
  opportunity_inr: number;
  bottleneck_station: string;
  is_key_valid?: boolean;
  validation_error?: string;
}
