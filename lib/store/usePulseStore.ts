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
} from "../types/pulse";

interface PulseState {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  inventory: InventoryItem[];
  kitchenQueue: KitchenTicket[];
  liveEvents: LiveEvent[];
  aiInsights: AIInsight[];
  aiMemory: AIMemoryItem[];
  governor: GovernorState;
  
  selectedTableId: string | null;
  activeRole: "customer" | "staff" | "manager";
  explainModalInsight: AIInsight | null;
  isScanningAI: boolean;

  setSelectedTableId: (id: string | null) => void;
  setActiveRole: (role: "customer" | "staff" | "manager") => void;
  setExplainModalInsight: (insight: AIInsight | null) => void;
  setAIBudgetMode: (mode: AIBudgetMode) => void;
  setAIConfiguration: (config: Partial<GovernorState>) => void;
  
  placeOrder: (tableId: string, items: { menuItemId: string; qty: number }[], customerName?: string) => void;
  advanceKitchenTicket: (ticketId: string) => void;
  clearTable: (tableId: string) => void;
  addLiveEvent: (type: LiveEvent["type"], description: string, severity?: LiveEvent["severity"], tableNumber?: number) => void;
  applyAIRecommendation: (insightId: string) => void;
  triggerExecutiveAudit: () => Promise<void>;
  
  // Computed Live State Selectors
  getComputedHealthScore: () => number;
  getComputedRiskLevel: () => "LOW" | "MODERATE" | "HIGH";
  getComputedOpportunity: () => number;
  getComputedBottleneck: () => string;
}

const INITIAL_TABLES: Table[] = [
  { id: "t1", table_number: 1, capacity: 2, status: "occupied", x_pos: 15, y_pos: 20, bill_amount: 3450, seated_at: "18:20" },
  { id: "t2", table_number: 2, capacity: 4, status: "kitchen_cooking", x_pos: 40, y_pos: 20, bill_amount: 5200, seated_at: "18:35" },
  { id: "t3", table_number: 3, capacity: 4, status: "available", x_pos: 65, y_pos: 20, bill_amount: 0 },
  { id: "t4", table_number: 4, capacity: 6, status: "served", x_pos: 90, y_pos: 20, bill_amount: 7800, seated_at: "17:45" },
  { id: "t5", table_number: 5, capacity: 2, status: "ordering", x_pos: 15, y_pos: 65, bill_amount: 2800, seated_at: "18:50" },
  { id: "t6", table_number: 6, capacity: 4, status: "available", x_pos: 40, y_pos: 65, bill_amount: 0 },
  { id: "t7", table_number: 7, capacity: 4, status: "needs_cleaning", x_pos: 65, y_pos: 65, bill_amount: 0 },
  { id: "t8", table_number: 8, capacity: 8, status: "available", x_pos: 90, y_pos: 65, bill_amount: 0 },
];

const INITIAL_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "A5 Wagyu Smoked Burger",
    category: "mains",
    price: 1850,
    prep_time_mins: 14,
    is_available: true,
    stock_qty: 18,
    description: "Miyazaki A5 Wagyu beef patty, smoked aged cheddar, truffle aioli on toasted brioche.",
    ingredients: ["A5 Wagyu Beef", "Aged Truffle Cheese", "Brioche Buns"],
    recommended_with: "m6",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m2",
    name: "Black Truffle Tagliatelle",
    category: "mains",
    price: 1650,
    prep_time_mins: 10,
    is_available: true,
    stock_qty: 12,
    description: "Fresh hand-rolled pasta, Norcia black truffle butter, 36-month Parmigiano Reggiano.",
    ingredients: ["Handcrafted Pasta", "Aged Truffle Cheese", "Butter"],
    recommended_with: "m5",
    image_url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m3",
    name: "Wood-Fired Burrata Pizza",
    category: "mains",
    price: 1450,
    prep_time_mins: 8,
    is_available: true,
    stock_qty: 24,
    description: "San Marzano tomatoes, fresh Puglia burrata, wild basil oil on 48h fermented sourdough crust.",
    ingredients: ["San Marzano Tomatoes", "Handcrafted Dough", "Burrata"],
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m4",
    name: "Crispy Calamari Fritti",
    category: "starters",
    price: 950,
    prep_time_mins: 6,
    is_available: true,
    stock_qty: 30,
    description: "Wild squid, citrus zest, spicy Calabrian chili aioli dip.",
    ingredients: ["Squid", "Chili Aioli"],
    image_url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "m5",
    name: "Chianti Classico Riserva 2018",
    category: "beverages",
    price: 1200,
    prep_time_mins: 2,
    is_available: true,
    stock_qty: 40,
    description: "Full-bodied Tuscan red wine with notes of dark cherry and subtle spice.",
    ingredients: ["Wine"],
  },
  {
    id: "m6",
    name: "Tiramisu al Pistacchio",
    category: "desserts",
    price: 750,
    prep_time_mins: 4,
    is_available: true,
    stock_qty: 15,
    description: "Pistachio cream, Bronte pistachio crunch, espresso-soaked ladyfingers.",
    ingredients: ["Pistachio Cream", "Espresso", "Mascarpone"],
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "i1", name: "A5 Wagyu Beef", current_stock: 4.5, min_threshold: 3.0, unit: "kg", unit_cost: 4500, est_runout_mins: 95, potential_loss: 8200 },
  { id: "i2", name: "Aged Truffle Cheese", current_stock: 0.8, min_threshold: 1.5, unit: "kg", unit_cost: 3200, est_runout_mins: 38, potential_loss: 4800 },
  { id: "i3", name: "San Marzano Tomatoes", current_stock: 12.0, min_threshold: 5.0, unit: "kg", unit_cost: 450, est_runout_mins: 240, potential_loss: 1800 },
  { id: "i4", name: "Handcrafted Sourdough", current_stock: 18.0, min_threshold: 8.0, unit: "pcs", unit_cost: 120, est_runout_mins: 180, potential_loss: 2400 },
];

const INITIAL_TICKETS: KitchenTicket[] = [
  { id: "k1", order_id: "ord-101", dish_name: "A5 Wagyu Smoked Burger", qty: 3, table_numbers: [2, 5], status: "cooking", station: "Station A (Grill)", prep_priority: "batched", created_at: "18:42" },
  { id: "k2", order_id: "ord-102", dish_name: "Black Truffle Tagliatelle", qty: 2, table_numbers: [2], status: "cooking", station: "Station B (Saute)", prep_priority: "high", created_at: "18:44" },
  { id: "k3", order_id: "ord-103", dish_name: "Wood-Fired Burrata Pizza", qty: 1, table_numbers: [4], status: "ready", station: "Station C (Assembly)", prep_priority: "normal", created_at: "18:35" },
];

const INITIAL_EVENTS: LiveEvent[] = [
  { id: "e1", timestamp: "18:50 PM", type: "order", description: "Table 5 placed order for 2x A5 Wagyu Burger", severity: "info", table_number: 5 },
  { id: "e2", timestamp: "18:48 PM", type: "ai", description: "PulseAI Governor batched 3 Wagyu Burger orders across Tables 2 & 5", severity: "success" },
  { id: "e3", timestamp: "18:44 PM", type: "inventory", description: "Low Stock Alert: Aged Truffle Cheese reached threshold (0.8 kg remaining)", severity: "warning" },
  { id: "e4", timestamp: "18:35 PM", type: "kitchen", description: "Station C completed Wood-Fired Burrata Pizza for Table 4", severity: "info", table_number: 4 },
];

const INITIAL_INSIGHTS: AIInsight[] = [
  {
    id: "ins-1",
    type: "bottleneck",
    title: "Kitchen Station A Overload & Smart Burger Batching",
    problem: "Station A (Grill) is experiencing a 14-minute prep delay due to concurrent burger requests.",
    cause: "5 Wagyu Burger orders received across Tables 2 & 5 within a 6-minute window.",
    recommendation: "Execute Smart CPU Batching on Station A: Cook all 5 Wagyu patties simultaneously and defer fry prep by 3 mins.",
    business_impact: {
      wait_reduction_pct: 18,
      revenue_increase_val: 3400,
      waste_reduction_pct: 5,
      kitchen_load_reduction_pct: 14,
    },
    confidence: 96,
    reasoning: [
      "Station A Grill surface utilization reached 88%",
      "Identical patty sear cycles permit simultaneous 5-unit batching",
      "Reduces total station heat cycles from 4 to 1",
    ],
    why_not: [
      "Why not open Line 2 Grill? ➔ Only 2 pending patty orders exist; extra line cook cost (₹800/hr) exceeds wait savings.",
      "Why not defer burgers? ➔ Table 5 guest expectation SLA is 12 mins.",
    ],
    snapshot_version: "v182",
    generated_ago_sec: 2,
    created_at: "Just now",
  },
];

const INITIAL_MEMORY: AIMemoryItem[] = [
  { id: "mem-1", timestamp: "18:30 PM", title: "Batched 4 Truffle Pasta Orders", action_taken: "Kitchen Station B Re-allocation", outcome_metric: "Table Wait Time", delta_pct: -16 },
  { id: "mem-2", timestamp: "17:45 PM", title: "Promoted Chianti Pairing on Table 4", action_taken: "Smart Recommendation Engine", outcome_metric: "Average Check Size", delta_pct: +14 },
];

export const usePulseStore = create<PulseState>((set, get) => ({
  tables: INITIAL_TABLES,
  menuItems: INITIAL_MENU,
  orders: [],
  inventory: INITIAL_INVENTORY,
  kitchenQueue: INITIAL_TICKETS,
  liveEvents: INITIAL_EVENTS,
  aiInsights: INITIAL_INSIGHTS,
  aiMemory: INITIAL_MEMORY,
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

    let topStation = "Grill Station A";
    let maxQty = 0;
    Object.entries(stationCounts).forEach(([st, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topStation = st;
      }
    });

    return topStation;
  },

  addLiveEvent: (type, description, severity = "info", table_number) =>
    set((state) => {
      const newEvent: LiveEvent = {
        id: `ev-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type,
        description,
        severity,
        table_number,
      };
      return { liveEvents: [newEvent, ...state.liveEvents.slice(0, 19)] };
    }),

  placeOrder: (tableId, items, customerName = "Guest") => {
    const state = get();
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return;

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

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      table_id: tableId,
      table_number: table.table_number,
      customer_name: customerName,
      status: "preparing",
      total_amount: orderTotal,
      wait_time_est: 12,
      created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      items: orderItems,
    };

    const updatedTables = state.tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status: "kitchen_cooking" as TableStatus,
            bill_amount: t.bill_amount + orderTotal,
            active_order_id: newOrder.id,
            seated_at: t.seated_at || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
          station: menu.name.includes("Burger") ? "Station A (Grill)" : "Station B (Saute)",
          prep_priority: "high",
          created_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

    set({
      orders: [newOrder, ...state.orders],
      tables: updatedTables,
      kitchenQueue: updatedQueue,
      inventory: updatedInventory,
    });

    state.addLiveEvent(
      "order",
      `Table ${table.table_number} placed order for ${items.length} items (₹${orderTotal.toLocaleString()})`,
      "info",
      table.table_number
    );
  },

  advanceKitchenTicket: (ticketId) => {
    const state = get();
    const ticket = state.kitchenQueue.find((t) => t.id === ticketId);
    if (!ticket) return;

    const nextStatus: "pending" | "cooking" | "ready" =
      ticket.status === "pending" ? "cooking" : ticket.status === "cooking" ? "ready" : "ready";

    const updatedQueue: KitchenTicket[] = state.kitchenQueue.map((t) =>
      t.id === ticketId ? { ...t, status: nextStatus } : t
    );

    let updatedTables = state.tables;
    if (nextStatus === "ready") {
      updatedTables = state.tables.map((t) =>
        ticket.table_numbers.includes(t.table_number) ? { ...t, status: "served" as TableStatus } : t
      );
    }

    set({ kitchenQueue: updatedQueue, tables: updatedTables });

    state.addLiveEvent(
      "kitchen",
      `Kitchen ${ticket.station} marked ${ticket.dish_name} as ${nextStatus.toUpperCase()}`,
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

    set({ tables: updatedTables });
    state.addLiveEvent("table", `Table ${table.table_number} cleared and reset to AVAILABLE`, "info", table.table_number);
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
      const startedAt = performance.now();
      const res = await fetch("/api/ai/health-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeOrdersCount: state.orders.length,
          tablesOccupied: state.tables.filter((t) => t.status !== "available").length,
          kitchenLoad: 84,
          lowInventory: state.inventory.filter((i) => i.current_stock <= i.min_threshold).map((i) => i.name),
          providerType: state.governor.provider_type,
          providerMode: state.governor.provider_mode,
          userApiKey: state.governor.personal_api_key || "",
          selectedModel: state.governor.selected_model,
        }),
      });

      const data = await res.json();
      if (data.success && data.insight) {
        const elapsed = Math.round(performance.now() - startedAt);
        const requestCount = state.governor.ai_requests_count + 1;
        const cacheHits = state.governor.cache_hit_count + (data.isCached ? 1 : 0);
        set((s) => ({
          aiInsights: [data.insight, ...s.aiInsights],
          governor: {
            ...s.governor,
            ai_requests_count: requestCount,
            cache_hit_count: cacheHits,
            tokens_saved_pct: requestCount ? Math.round((cacheHits / requestCount) * 100) : 0,
            avg_latency_ms: elapsed,
            is_offline_fallback: Boolean(data.isFallback),
            last_scan_time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            health_score: data.healthScore || s.getComputedHealthScore(),
            last_error: undefined,
          },
        }));

        state.addLiveEvent("ai", `Executive Operations Audit complete (Health Score: ${data.healthScore || state.getComputedHealthScore()}%)`, "success");
      } else {
        set((s) => ({ governor: { ...s.governor, last_error: data.error || "The AI request failed." } }));
      }
    } catch (err) {
      set((s) => ({ governor: { ...s.governor, last_error: "The AI request could not reach the server." } }));
    } finally {
      set({ isScanningAI: false });
    }
  },
}));
