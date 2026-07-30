import { create } from "zustand";
import {
  Table,
  MenuItem,
  Order,
  InventoryItem,
  KitchenTicket,
  LiveEvent,
  AIInsight,
  AIMemoryItem,
  GovernorState,
  AIBudgetMode,
  TableStatus,
  StaffMember,
  PaymentInfo,
  OrderHistoryItem,
} from "../types/pulse";

interface PulseState {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  orderHistory: OrderHistoryItem[];
  inventory: InventoryItem[];
  kitchenQueue: KitchenTicket[];
  liveEvents: LiveEvent[];
  aiInsights: AIInsight[];
  aiMemory: AIMemoryItem[];
  governor: GovernorState;
  staff: StaffMember[];
  
  selectedTableId: string | null;
  activeRole: "customer" | "staff" | "manager";
  explainModalInsight: AIInsight | null;
  isScanningAI: boolean;

  setSelectedTableId: (id: string | null) => void;
  setActiveRole: (role: "customer" | "staff" | "manager") => void;
  setExplainModalInsight: (insight: AIInsight | null) => void;
  setAIBudgetMode: (mode: AIBudgetMode) => void;
  setAIConfiguration: (config: Partial<GovernorState>) => void;
  
  addStaff: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  toggleStaffStatus: (id: string) => void;
  removeStaff: (id: string) => void;
  
  placeOrder: (tableId: string, items: { menuItemId: string; qty: number }[], customerName?: string) => void;
  seatTable: (tableId: string) => void;
  advanceKitchenTicket: (ticketId: string) => void;
  clearTable: (tableId: string) => void;
  /** Checkout: compute GST + tip, push a paid OrderHistoryItem, clear table. */
  checkoutTable: (tableId: string, payment: PaymentInfo) => void;
  getRevenueToday: () => number;
  addLiveEvent: (type: LiveEvent["type"], description: string, severity?: LiveEvent["severity"], tableNumber?: number) => void;
  applyAIRecommendation: (insightId: string) => void;
  triggerExecutiveAudit: () => Promise<void>;
  /** Real (or demo) advisor chat through the provider layer. Returns the
   *  assistant text so the caller can push it into local message state. */
  sendAdvisorMessage: (question: string) => Promise<string>;
  
  // Computed Live State Selectors
  getComputedHealthScore: () => number;
  getComputedRiskLevel: () => "LOW" | "MODERATE" | "HIGH";
  getComputedOpportunity: () => number;
  getComputedBottleneck: () => string;
}

const INITIAL_TABLES: Table[] = [
  { id: "t1", table_number: 1, capacity: 2, status: "occupied", x_pos: 15, y_pos: 20, bill_amount: 3450, seated_at: "6:20 PM", assigned_waiter_id: "s6" },
  { id: "t2", table_number: 2, capacity: 4, status: "kitchen_cooking", x_pos: 40, y_pos: 20, bill_amount: 5200, seated_at: "6:35 PM", assigned_waiter_id: "s5" },
  { id: "t3", table_number: 3, capacity: 4, status: "available", x_pos: 65, y_pos: 20, bill_amount: 0 },
  { id: "t4", table_number: 4, capacity: 6, status: "served", x_pos: 90, y_pos: 20, bill_amount: 7800, seated_at: "5:45 PM", assigned_waiter_id: "s6" },
  { id: "t5", table_number: 5, capacity: 2, status: "ordering", x_pos: 15, y_pos: 65, bill_amount: 2800, seated_at: "6:50 PM", assigned_waiter_id: "s5" },
  { id: "t6", table_number: 6, capacity: 4, status: "available", x_pos: 40, y_pos: 65, bill_amount: 0 },
  { id: "t7", table_number: 7, capacity: 4, status: "needs_cleaning", x_pos: 65, y_pos: 65, bill_amount: 0 },
  { id: "t8", table_number: 8, capacity: 8, status: "available", x_pos: 90, y_pos: 65, bill_amount: 0 },
];

const INITIAL_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "Galouti Kebab",
    category: "starters",
    price: 650,
    prep_time_mins: 7,
    is_available: true,
    stock_qty: 22,
    description: "Lucknowi minced mutton patties, smoked clove and cardamom, melted ghee, sheermal.",
    ingredients: ["Mutton", "Ghee", "Tandoor Masala"],
    recommended_with: "m9",
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m2",
    name: "Paneer Tikka Shashlik",
    category: "starters",
    price: 520,
    prep_time_mins: 8,
    is_available: true,
    stock_qty: 26,
    description: "Char-grilled paneer, bell peppers and onion in a yogurt-tandoori marinade.",
    ingredients: ["Paneer", "Yogurt", "Tandoor Masala"],
    recommended_with: "m9",
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m3",
    name: "Tandoori Prawns",
    category: "starters",
    price: 780,
    prep_time_mins: 9,
    is_available: true,
    stock_qty: 14,
    description: "Jumbo prawns in saffron-ajoblancho marinade, fired in the clay tandoor.",
    ingredients: ["Prawns", "Saffron", "Yogurt"],
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m4",
    name: "Butter Chicken",
    category: "mains",
    price: 720,
    prep_time_mins: 12,
    is_available: true,
    stock_qty: 20,
    description: "Tandoor-charred chicken in a silky tomato, cashew and fenugreek gravy.",
    ingredients: ["Mutton", "Fresh Cream", "Tandoor Masala"],
    recommended_with: "m11",
    image_url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m5",
    name: "Hyderabadi Dum Biryani",
    category: "mains",
    price: 690,
    prep_time_mins: 18,
    is_available: true,
    stock_qty: 16,
    description: "Long-grain basmati layered with marinated mutton, saffron and fried onion, sealed and dum-cooked.",
    ingredients: ["Basmati Rice", "Mutton", "Saffron"],
    recommended_with: "m12",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m6",
    name: "Dal Bukhara",
    category: "mains",
    price: 480,
    prep_time_mins: 10,
    is_available: true,
    stock_qty: 30,
    description: "Whole black urad lentils simmered overnight with tomato, butter and cream.",
    ingredients: ["Fresh Cream", "Tandoor Masala"],
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m7",
    name: "Rogan Josh",
    category: "mains",
    price: 820,
    prep_time_mins: 15,
    is_available: true,
    stock_qty: 12,
    description: "Kashmiri mutton curry, Kashmiri chilli and fennel, deep red oil, slow-cooked.",
    ingredients: ["Mutton", "Tandoor Masala"],
    image_url: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m8",
    name: "Malai Kofta",
    category: "mains",
    price: 560,
    prep_time_mins: 11,
    is_available: true,
    stock_qty: 18,
    description: "Paneer and potato dumplings in a mellow cashew-saffron curry.",
    ingredients: ["Paneer", "Fresh Cream", "Saffron"],
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m9",
    name: "Gulab Jamun",
    category: "desserts",
    price: 290,
    prep_time_mins: 5,
    is_available: true,
    stock_qty: 28,
    description: "Khoya dumplings, cardamom-rose syrup, warm, served with rabri.",
    ingredients: ["Fresh Cream"],
    image_url: "https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m10",
    name: "Phirni",
    category: "desserts",
    price: 240,
    prep_time_mins: 4,
    is_available: true,
    stock_qty: 24,
    description: "Ground-rice pudding, saffron and pistachio, set cold in earthen kulhad.",
    ingredients: ["Saffron", "Fresh Cream"],
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m11",
    name: "Masala Chai",
    category: "beverages",
    price: 120,
    prep_time_mins: 3,
    is_available: true,
    stock_qty: 50,
    description: "Assam tea, crushed cardamom, ginger, simmered with milk.",
    ingredients: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m12",
    name: "Salted Lassi",
    category: "beverages",
    price: 150,
    prep_time_mins: 2,
    is_available: true,
    stock_qty: 45,
    description: "Chilled yogurt drink, roasted cumin, a pinch of black salt.",
    ingredients: ["Yogurt"],
    image_url: "https://images.unsplash.com/photo-1586625267686-139acc5abc33?auto=format&fit=crop&w=400&q=80",
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "i1", name: "Mutton", current_stock: 4.2, min_threshold: 3.0, unit: "kg", unit_cost: 850, est_runout_mins: 95, potential_loss: 8200 },
  { id: "i2", name: "Paneer", current_stock: 0.9, min_threshold: 1.5, unit: "kg", unit_cost: 420, est_runout_mins: 38, potential_loss: 4800 },
  { id: "i3", name: "Basmati Rice", current_stock: 12.0, min_threshold: 5.0, unit: "kg", unit_cost: 140, est_runout_mins: 240, potential_loss: 1800 },
  { id: "i4", name: "Fresh Cream", current_stock: 6.0, min_threshold: 4.0, unit: "L", unit_cost: 180, est_runout_mins: 180, potential_loss: 2400 },
  { id: "i5", name: "Saffron", current_stock: 0.05, min_threshold: 0.08, unit: "kg", unit_cost: 240000, est_runout_mins: 64, potential_loss: 3200 },
  { id: "i6", name: "Ghee", current_stock: 3.5, min_threshold: 2.0, unit: "kg", unit_cost: 620, est_runout_mins: 210, potential_loss: 1600 },
];

const INITIAL_TICKETS: KitchenTicket[] = [
  { id: "k1", order_id: "ord-101", dish_name: "Butter Chicken", qty: 3, table_numbers: [2, 5], status: "cooking", station: "Curry/Handi", prep_priority: "batched", created_at: "18:42" },
  { id: "k2", order_id: "ord-102", dish_name: "Hyderabadi Dum Biryani", qty: 2, table_numbers: [2], status: "cooking", station: "Tawa/Biryani", prep_priority: "high", created_at: "18:44" },
  { id: "k3", order_id: "ord-103", dish_name: "Galouti Kebab", qty: 1, table_numbers: [4], status: "ready", station: "Tandoor/Grill", prep_priority: "normal", created_at: "18:35" },
];

const INITIAL_EVENTS: LiveEvent[] = [
  { id: "e1", timestamp: "6:50 PM", type: "order", description: "Table 5 placed order for 2x Butter Chicken", severity: "info", table_number: 5 },
  { id: "e2", timestamp: "6:48 PM", type: "ai", description: "PulseAI Governor batched 3 Butter Chicken orders across Tables 2 & 5", severity: "success" },
  { id: "e3", timestamp: "6:44 PM", type: "inventory", description: "Low Stock Alert: Paneer reached threshold (0.9 kg remaining)", severity: "warning" },
  { id: "e4", timestamp: "6:35 PM", type: "kitchen", description: "Tandoor/Grill completed Galouti Kebab for Table 4", severity: "info", table_number: 4 },
];

const INITIAL_INSIGHTS: AIInsight[] = [
  {
    id: "ins-1",
    type: "bottleneck",
    title: "Curry/Handi Overload & Smart Butter Chicken Batching",
    problem: "Curry/Handi is experiencing a 14-minute prep delay due to concurrent curry requests.",
    cause: "5 Butter Chicken orders received across Tables 2 & 5 within a 6-minute window.",
    recommendation: "Execute Smart CPU Batching on Curry/Handi: build one large gravy base and split across the 5 portions, defer naan to Tandoor/Grill by 3 mins.",
    business_impact: {
      wait_reduction_pct: 18,
      revenue_increase_val: 3400,
      waste_reduction_pct: 5,
      kitchen_load_reduction_pct: 14,
    },
    confidence: 96,
    reasoning: [
      "Curry/Handi burner utilization reached 88%",
      "Identical butter-chicken gravy cycles permit simultaneous 5-unit batching",
      "Reduces total gravy reductions from 4 batches to 1",
    ],
    why_not: [
      "Why not open a second Handi? ➔ Only 2 pending curry orders remain; extra line cook cost (₹800/hr) exceeds wait savings.",
      "Why not defer the curries? ➔ Table 5 guest expectation SLA is 12 mins.",
    ],
    snapshot_version: "v182",
    generated_ago_sec: 2,
    created_at: "Just now",
  },
];

const INITIAL_MEMORY: AIMemoryItem[] = [
  { id: "mem-1", timestamp: "6:30 PM", title: "Batched 4 Dal Bukhara Orders", action_taken: "Curry/Handi Re-allocation", outcome_metric: "Table Wait Time", delta_pct: -16 },
  { id: "mem-2", timestamp: "5:45 PM", title: "Promoted Phirni Upsell on Table 4", action_taken: "Smart Recommendation Engine", outcome_metric: "Average Check Size", delta_pct: +14 },
];

const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", full_name: "Marcus Chen", email: "marcus@pulseos.com", role: "head_chef", hourly_rate: 450, shift_status: "on_duty", performance_rating: 4.8, shift_start: "2:00 PM", avatar_url: "https://api.dicebear.com/8.x/notionists/svg?seed=MarcusChen&backgroundColor=b6e3f4" },
  { id: "s2", full_name: "Priya Sharma", email: "priya@pulseos.com", role: "sous_chef", hourly_rate: 320, shift_status: "on_duty", performance_rating: 4.9, shift_start: "3:00 PM", avatar_url: "https://api.dicebear.com/8.x/notionists/svg?seed=PriyaSharma&backgroundColor=ffd5dc" },
  { id: "s3", full_name: "Raj Patel", email: "raj@pulseos.com", role: "line_cook", hourly_rate: 220, shift_status: "on_duty", performance_rating: 4.2, shift_start: "4:00 PM", avatar_url: "https://api.dicebear.com/8.x/notionists/svg?seed=RajPatel&backgroundColor=c0aede" },
  { id: "s4", full_name: "Sofia Martinez", email: "sofia@pulseos.com", role: "sommelier", hourly_rate: 350, shift_status: "off_duty", performance_rating: 4.7, avatar_url: "https://api.dicebear.com/8.x/notionists/svg?seed=SofiaMartinez&backgroundColor=d1f4d3" },
  { id: "s5", full_name: "Arjun Mehra", email: "arjun@pulseos.com", role: "floor_captain", hourly_rate: 280, shift_status: "break", performance_rating: 4.5, shift_start: "2:30 PM", avatar_url: "https://api.dicebear.com/8.x/notionists/svg?seed=ArjunMehra&backgroundColor=ffdfbf" },
  { id: "s6", full_name: "Anita Joshi", email: "anita@pulseos.com", role: "floor_waiter", hourly_rate: 180, shift_status: "on_duty", performance_rating: 4.4, shift_start: "5:00 PM", avatar_url: "https://api.dicebear.com/8.x/notionists/svg?seed=AnitaJoshi&backgroundColor=ffd5dc" },
];

/** Route an Indian menu item to a kitchen station by category + name.
 *  Tandoor/Grill = kebabs, tandoori, grilled starters.
 *  Tawa/Biryani = biryani and rice.
 *  Curry/Handi = curries and slow-cooked mains.
 *  Assembly/Desserts = desserts and beverages. */
function stationFor(menu: MenuItem): KitchenTicket["station"] {
  const name = menu.name.toLowerCase();
  if (name.includes("biryani")) {
    return "Tawa/Biryani";
  }
  if (name.includes("kebab") || name.includes("tandoori") || name.includes("tikka") || name.includes("prawns")) {
    return "Tandoor/Grill";
  }
  if (menu.category === "desserts" || menu.category === "beverages") {
    return "Assembly/Desserts";
  }
  return "Curry/Handi";
}

export const usePulseStore = create<PulseState>((set, get) => ({
  tables: INITIAL_TABLES,
  menuItems: INITIAL_MENU,
  orders: [
    {
      id: "ord-demo-001",
      table_id: "t1",
      table_number: 1,
      customer_name: "Rahul M.",
      items: [
        { id: "oi-1", order_id: "ord-demo-001", menu_item_id: "m1", item_name: "Galouti Kebab", qty: 2, price: 650, status: "served" as const },
        { id: "oi-2", order_id: "ord-demo-001", menu_item_id: "m11", item_name: "Masala Chai", qty: 2, price: 120, status: "served" as const },
      ],
      status: "served" as const,
      total_amount: 1540,
      created_at: "6:20 PM",
      wait_time_est: 0,
    },
    {
      id: "ord-demo-002",
      table_id: "t2",
      table_number: 2,
      customer_name: "Priya K.",
      items: [
        { id: "oi-3", order_id: "ord-demo-002", menu_item_id: "m4", item_name: "Butter Chicken", qty: 1, price: 720, status: "preparing" as const },
        { id: "oi-4", order_id: "ord-demo-002", menu_item_id: "m5", item_name: "Hyderabadi Dum Biryani", qty: 1, price: 690, status: "preparing" as const },
        { id: "oi-5", order_id: "ord-demo-002", menu_item_id: "m12", item_name: "Salted Lassi", qty: 2, price: 150, status: "preparing" as const },
      ],
      status: "preparing" as const,
      total_amount: 1710,
      created_at: "6:35 PM",
      wait_time_est: 12,
    },
    {
      id: "ord-demo-003",
      table_id: "t4",
      table_number: 4,
      customer_name: "Aditya S.",
      items: [
        { id: "oi-6", order_id: "ord-demo-003", menu_item_id: "m6", item_name: "Dal Bukhara", qty: 2, price: 480, status: "served" as const },
        { id: "oi-7", order_id: "ord-demo-003", menu_item_id: "m7", item_name: "Rogan Josh", qty: 1, price: 820, status: "served" as const },
        { id: "oi-8", order_id: "ord-demo-003", menu_item_id: "m9", item_name: "Gulab Jamun", qty: 2, price: 290, status: "served" as const },
        { id: "oi-9", order_id: "ord-demo-003", menu_item_id: "m10", item_name: "Phirni", qty: 1, price: 240, status: "served" as const },
      ],
      status: "completed" as const,
      total_amount: 2790,
      created_at: "5:45 PM",
      wait_time_est: 0,
    },
    {
      id: "ord-demo-004",
      table_id: "t5",
      table_number: 5,
      customer_name: "Alex (Guest)",
      items: [
        { id: "oi-10", order_id: "ord-demo-004", menu_item_id: "m2", item_name: "Paneer Tikka Shashlik", qty: 1, price: 520, status: "preparing" as const },
        { id: "oi-11", order_id: "ord-demo-004", menu_item_id: "m4", item_name: "Butter Chicken", qty: 2, price: 720, status: "pending" as const },
      ],
      status: "pending" as const,
      total_amount: 1960,
      created_at: "6:50 PM",
      wait_time_est: 18,
    },
  ],
  orderHistory: [],
  inventory: INITIAL_INVENTORY,
  kitchenQueue: INITIAL_TICKETS,
  liveEvents: INITIAL_EVENTS,
  aiInsights: INITIAL_INSIGHTS,
  aiMemory: INITIAL_MEMORY,
  staff: INITIAL_STAFF,
  governor: {
    provider_type: "gemini",
    provider_mode: "demo",
    selected_model: "gemini-3.6-flash",
    budget_mode: "balanced",
    today_budget_inr: 0,
    budget_used_inr: 0,
    ai_requests_count: 0,
    cache_hit_count: 0,
    tokens_saved_pct: 0,
    avg_latency_ms: 0,
    is_offline_fallback: true,
    today_ai_cost_inr: 0,
    without_governor_cost_inr: 0,
    health_score: 0,
    risk_level: "MODERATE",
    opportunity_inr: 0,
    bottleneck_station: "",
  },

  selectedTableId: "t5",
  activeRole: "staff",
  explainModalInsight: null,
  isScanningAI: false,

  setSelectedTableId: (id) => set({ selectedTableId: id }),
  setActiveRole: (role) => set({ activeRole: role }),
  setExplainModalInsight: (insight) => set({ explainModalInsight: insight }),
  setAIBudgetMode: (mode) =>
    set((state) => ({
      governor: { ...state.governor, budget_mode: mode },
    })),
  setAIConfiguration: (config) =>
    set((state) => ({ governor: { ...state.governor, ...config } })),

  addStaff: (staffData) =>
    set((state) => ({
      staff: [{ ...staffData, id: `s-${Date.now()}` }, ...state.staff],
    })),
  updateStaff: (id, updates) =>
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  toggleStaffStatus: (id) =>
    set((state) => ({
      staff: state.staff.map((s) => {
        if (s.id === id) {
          const nextStatus =
            s.shift_status === "on_duty"
              ? "break"
              : s.shift_status === "break"
              ? "off_duty"
              : "on_duty";
          return { ...s, shift_status: nextStatus };
        }
        return s;
      }),
    })),
  removeStaff: (id) =>
    set((state) => ({
      staff: state.staff.filter((s) => s.id !== id),
    })),

  // Dynamic Live State Computation Selectors
  getComputedHealthScore: () => {
    const s = get();
    const lowStockCount = s.inventory.filter((i) => i.current_stock <= i.min_threshold).length;
    const activeTicketsCount = s.kitchenQueue.filter((k) => k.status === "cooking").length;
    const occupiedTables = s.tables.filter((t) => t.status !== "available").length;

    let score = 100;
    score -= lowStockCount * 6;
    score -= activeTicketsCount * 2;
    if (occupiedTables > 5) score -= 4;
    return Math.max(55, Math.min(99, score));
  },

  getComputedRiskLevel: () => {
    const s = get();
    const lowStockCount = s.inventory.filter((i) => i.current_stock <= i.min_threshold).length;
    const cookingCount = s.kitchenQueue.filter((k) => k.status === "cooking").length;

    if (lowStockCount >= 2 || cookingCount >= 5) return "HIGH";
    if (lowStockCount >= 1 || cookingCount >= 3) return "MODERATE";
    return "LOW";
  },

  getComputedOpportunity: () => {
    const s = get();
    const totalBill = s.tables.reduce((sum, t) => sum + t.bill_amount, 0);
    return Math.round(totalBill * 0.22 + 1800);
  },

  getComputedBottleneck: () => {
    const s = get();
    const stationCounts: Record<string, number> = {};
    s.kitchenQueue.forEach((tk) => {
      stationCounts[tk.station] = (stationCounts[tk.station] || 0) + tk.qty;
    });

    let topStation = "None";
    let maxQty = 0;
    Object.entries(stationCounts).forEach(([st, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topStation = st;
      }
    });

    // With an empty kitchen the old default "Grill Station A" was a lie —
    // it claimed a bottleneck where none existed.
    return maxQty === 0 ? "None" : topStation;
  },

  addLiveEvent: (type, description, severity = "info", table_number) =>
    set((state) => {
      const now = new Date();
      const newEvent: LiveEvent = {
        id: `ev-${Date.now()}`,
        timestamp: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        type,
        description,
        severity,
        table_number,
      };
      return { liveEvents: [newEvent, ...state.liveEvents.slice(0, 19)] };
    }),

  seatTable: (tableId) => set((state) => ({
    tables: state.tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status: "occupied" as const,
            seated_at: new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          }
        : t
    ),
  })),

  placeOrder: (tableId, items, customerName = "Guest") => {
    const state = get();
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return;

    // 6.13: cannot order on a table that isn't ready for guests. A free table
    // gets auto-seated; a dirty/blocked table is rejected silently (the guest
    // UI now disables order on such tables too).
    if (table.status === "needs_cleaning") {
      state.addLiveEvent(
        "table",
        `Order rejected: Table ${table.table_number} needs clearing first.`,
        "danger",
        table.table_number
      );
      return;
    }

    // Stock guard (6.14): refuse to oversell a menu item past its stock.
    for (const item of items) {
      const menu = state.menuItems.find((m) => m.id === item.menuItemId);
      if (!menu) continue;
      if (menu.stock_qty < item.qty) {
        state.addLiveEvent(
          "order",
          `Order rejected: only ${menu.stock_qty} × ${menu.name} left.`,
          "danger",
          table.table_number
        );
        return;
      }
    }

    let orderTotal = 0;
    const orderItems = items.map((item) => {
      const menu = state.menuItems.find((m) => m.id === item.menuItemId);
      const price = menu ? menu.price : 0;
      orderTotal += price * item.qty;
      return {
        id: `oi-${Date.now()}-${item.menuItemId}`,
        order_id: `ord-${Date.now()}`,
        menu_item_id: item.menuItemId,
        item_name: menu ? menu.name : "Item",
        price,
        qty: item.qty,
        status: "pending" as const,
      };
    });

    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      table_id: tableId,
      table_number: table.table_number,
      customer_name: customerName,
      status: "preparing",
      total_amount: orderTotal,
      wait_time_est: 12,
      created_at: now,
      items: orderItems,
    };

    const wasAvailable = table.status === "available";
    const updatedTables = state.tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            // 6.13: only flip an available table to cooking; a seated/ordering
            // table keeps its current status lineage.
            status: "kitchen_cooking" as TableStatus,
            bill_amount: t.bill_amount + orderTotal,
            active_order_id: newOrder.id,
            seated_at: t.seated_at || now,
          }
        : t
    );

    let updatedQueue = [...state.kitchenQueue];
    items.forEach((item) => {
      const menu = state.menuItems.find((m) => m.id === item.menuItemId);
      if (!menu) return;

      const existingTicket = updatedQueue.find(
        (tk) => tk.dish_name === menu.name && tk.status === "cooking"
      );

      if (existingTicket) {
        existingTicket.qty += item.qty;
        if (!existingTicket.table_numbers.includes(table.table_number)) {
          existingTicket.table_numbers.push(table.table_number);
        }
        existingTicket.prep_priority = "batched";
      } else {
        updatedQueue.unshift({
          id: `k-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          order_id: newOrder.id,
          dish_name: menu.name,
          qty: item.qty,
          table_numbers: [table.table_number],
          status: "cooking",
          // 6.15: route across all three stations by category, not the old
          // Burger->A / else->B binary that starved Station C.
          station: stationFor(menu),
          prep_priority: "high",
          created_at: now,
        });
      }
    });

    const updatedInventory = state.inventory.map((inv) => {
      if (inv.name === "A5 Wagyu Beef" && items.some((i) => i.menuItemId === "m1")) {
        return { ...inv, current_stock: Math.max(0, inv.current_stock - 0.4) };
      }
      if (inv.name === "Aged Truffle Cheese" && items.some((i) => i.menuItemId === "m2" || i.menuItemId === "m1")) {
        return { ...inv, current_stock: Math.max(0, inv.current_stock - 0.15) };
      }
      return inv;
    });

    // 6.14: menu cards now show real, decrementing stock.
    const updatedMenu = state.menuItems.map((m) => {
      const ordered = items.find((i) => i.menuItemId === m.id);
      return ordered ? { ...m, stock_qty: Math.max(0, m.stock_qty - ordered.qty) } : m;
    });

    set({
      orders: [newOrder, ...state.orders],
      tables: updatedTables,
      kitchenQueue: updatedQueue,
      inventory: updatedInventory,
      menuItems: updatedMenu,
    });

    state.addLiveEvent(
      "order",
      `Table ${table.table_number} placed order for ${items.length} item${items.length === 1 ? "" : "s"} (₹${orderTotal.toLocaleString()})${wasAvailable ? " · table seated" : ""}`,
      "info",
      table.table_number
    );
  },

  advanceKitchenTicket: (ticketId) => {
    const state = get();
    const ticket = state.kitchenQueue.find((t) => t.id === ticketId);
    if (!ticket) return;

    // 6.5: ready is terminal. Previously the fall-through mapped ready->ready,
    // so clicking "Mark ready" again re-fired the table status update +
    // duplicate live event, and the queue grew unbounded. Now we no-op.
    if (ticket.status === "ready") return;

    const nextStatus: "pending" | "cooking" | "ready" =
      ticket.status === "pending" ? "cooking" : "ready";

    let updatedTables = state.tables;
    if (nextStatus === "ready") {
      updatedTables = state.tables.map((t) =>
        ticket.table_numbers.includes(t.table_number) ? { ...t, status: "served" as TableStatus } : t
      );
    }

    if (nextStatus === "ready") {
      // Terminal state: drop the ticket from the active queue entirely.
      set({
        kitchenQueue: state.kitchenQueue.filter((t) => t.id !== ticketId),
        tables: updatedTables,
      });
    } else {
      set({
        kitchenQueue: state.kitchenQueue.map((t) =>
          t.id === ticketId ? { ...t, status: nextStatus } : t
        ),
      });
    }

    state.addLiveEvent(
      "kitchen",
      nextStatus === "ready"
        ? `${ticket.dish_name} is up — Table ${ticket.table_numbers.join(" + ")} served`
        : `Kitchen ${ticket.station} started ${ticket.dish_name}`,
      nextStatus === "ready" ? "success" : "info"
    );
  },

  clearTable: (tableId) => {
    const state = get();
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return;

    const updatedTables = state.tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status: "available" as TableStatus,
            bill_amount: 0,
            active_order_id: undefined,
            seated_at: undefined,
          }
        : t
    );

    // 6.6: complete the table's open orders. Otherwise the customer page's
    // activeOrder lookup (any non-completed order) re-shows the tracker banner
    // for a table the manager just cleared.
    const updatedOrders = state.orders.map((o) =>
      o.table_id === tableId && o.status !== "completed" && o.status !== "cancelled"
        ? { ...o, status: "completed" as const }
        : o
    );

    set({ tables: updatedTables, orders: updatedOrders });
    state.addLiveEvent("table", `Table ${table.table_number} cleared and back in service`, "info", table.table_number);
  },

  checkoutTable: (tableId, payment) => {
    const state = get();
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return;

    // Build the history item from the table's open order if present.
    const openOrder = state.orders.find(
      (o) => o.table_id === tableId && o.status !== "completed" && o.status !== "cancelled"
    );

    const items = openOrder
      ? openOrder.items.map((i) => ({ name: i.item_name, qty: i.qty, price: i.price }))
      : [{ name: "Table bill", qty: 1, price: table.bill_amount }];

    const historyItem: OrderHistoryItem = {
      order_id: openOrder?.id ?? `bill-${table.id}`,
      table_number: table.table_number,
      customer_name: openOrder?.customer_name ?? "Guest",
      items,
      total_amount: payment.subtotal,
      tax_amount: payment.tax_amount,
      tip_amount: payment.tip_amount,
      payment_status: "paid",
      payment_method: payment.method,
      created_at: openOrder?.created_at ?? new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    // Reuse clearTable's table+order reset, then record the payment.
    get().clearTable(tableId);
    set({ orderHistory: [historyItem, ...get().orderHistory] });
    get().addLiveEvent(
      "order",
      `Table ${table.table_number} paid ₹${payment.grand_total.toLocaleString("en-IN")} via ${payment.method.toUpperCase()}`,
      "success",
      table.table_number
    );
  },

  getRevenueToday: () => {
    const state = get();
    const today = new Date().toDateString();
    return state.orderHistory
      .filter((o) => new Date(o.completed_at ?? o.created_at).toDateString() === today)
      .reduce((sum, o) => sum + o.total_amount + o.tax_amount + o.tip_amount, 0);
  },

  applyAIRecommendation: (insightId) => {
    const state = get();
    const insight = state.aiInsights.find((i) => i.id === insightId);
    if (!insight) return;

    const newMemory: AIMemoryItem = {
      id: `mem-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: insight.title,
      action_taken: insight.recommendation.substring(0, 45) + "...",
      outcome_metric: "Wait Time Reduction",
      delta_pct: -insight.business_impact.wait_reduction_pct,
    };

    set({
      aiMemory: [newMemory, ...state.aiMemory],
      aiInsights: state.aiInsights.filter((i) => i.id !== insightId),
      governor: {
        ...state.governor,
        tokens_saved_pct: Math.min(96, state.governor.tokens_saved_pct + 1),
      },
    });

    state.addLiveEvent("ai", `Applied Executive Action: ${insight.title} (Wait Time -${insight.business_impact.wait_reduction_pct}%)`, "success");
  },

  triggerExecutiveAudit: async () => {
    const state = get();
    set({ isScanningAI: true });

    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_audit",
          activeOrdersCount: state.orders.length,
          tablesOccupied: state.tables.filter((t) => t.status !== "available").length,
          kitchenLoad: 84,
          lowInventory: state.inventory
            .filter((i) => i.current_stock <= i.min_threshold)
            .map((i) => i.name),
          providerType: state.governor.provider_type,
          providerMode: state.governor.provider_mode,
          userApiKey: state.governor.personal_api_key || "",
          selectedModel: state.governor.selected_model,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.insight) {
        const t = data.telemetry;
        const requestCount = state.governor.ai_requests_count + 1;
        const cacheHits = state.governor.cache_hit_count + (data.isCached ? 1 : 0);
        const addedCost = t?.estimatedCostInr ?? 0; // demo/fallback = 0
        const addedLatency = t?.latencyMs ?? 0;
        const healthScore = data.healthScore || state.getComputedHealthScore();

        set((s) => ({
          aiInsights: [data.insight, ...s.aiInsights],
          governor: {
            ...s.governor,
            ai_requests_count: requestCount,
            cache_hit_count: cacheHits,
            tokens_saved_pct: requestCount ? Math.round((cacheHits / requestCount) * 100) : 0,
            avg_latency_ms: addedLatency || s.governor.avg_latency_ms,
            today_ai_cost_inr: Math.round((s.governor.today_ai_cost_inr + addedCost) * 100) / 100,
            budget_used_inr: Math.round((s.governor.budget_used_inr + addedCost) * 100) / 100,
            is_offline_fallback: Boolean(data.isFallback),
            last_scan_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            health_score: healthScore,
            last_error: undefined,
          },
        }));

        state.addLiveEvent(
          "ai",
          data.isFallback
            ? `Audit ran on the deterministic engine (Health ${healthScore}%).`
            : `Live audit complete — ${state.governor.provider_type} ${state.governor.selected_model} (Health ${healthScore}%).`,
          "success"
        );
      } else {
        const msg = data.error || "The audit failed.";
        set((s) => ({ governor: { ...s.governor, last_error: msg } }));
        state.addLiveEvent("ai", `Audit failed: ${msg}`, "danger");
      }
    } catch (err) {
      const msg = "The audit could not reach the server.";
      set((s) => ({ governor: { ...s.governor, last_error: msg } }));
    } finally {
      set({ isScanningAI: false });
    }
  },

  sendAdvisorMessage: async (question) => {
    const state = get();
    try {
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_chat",
          question,
          activeOrdersCount: state.orders.length,
          tablesOccupied: state.tables.filter((t) => t.status !== "available").length,
          kitchenLoad: 84,
          lowInventory: state.inventory
            .filter((i) => i.current_stock <= i.min_threshold)
            .map((i) => i.name),
          providerType: state.governor.provider_type,
          providerMode: state.governor.provider_mode,
          userApiKey: state.governor.personal_api_key || "",
          selectedModel: state.governor.selected_model,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const t = data.telemetry;
        if (t) {
          set((s) => ({
            governor: {
              ...s.governor,
              ai_requests_count: s.governor.ai_requests_count + 1,
              avg_latency_ms: t.latencyMs || s.governor.avg_latency_ms,
              today_ai_cost_inr:
                Math.round((s.governor.today_ai_cost_inr + (t.estimatedCostInr ?? 0)) * 100) / 100,
              budget_used_inr:
                Math.round((s.governor.budget_used_inr + (t.estimatedCostInr ?? 0)) * 100) / 100,
              last_error: undefined,
            },
          }));
        }
        return data.text as string;
      }
      set((s) => ({ governor: { ...s.governor, last_error: data.error || "The advisor failed." } }));
      return data.error || "The advisor could not answer that.";
    } catch (err) {
      set((s) => ({ governor: { ...s.governor, last_error: "The advisor could not reach the server." } }));
      return "The advisor could not reach the server.";
    }
  },
}));
