"use client";

import Navbar from "@/components/Navbar";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { useState } from "react";
import { ShoppingBag, Clock, Sparkles, Check, Plus, Minus, CheckCircle, Flame, ArrowRight, Utensils } from "lucide-react";

export default function CustomerPortal() {
  const { menuItems, placeOrder, orders, tables, selectedTableId, setSelectedTableId } = usePulseStore();
  const [selectedCategory, setSelectedCategory] = useState<"starters" | "mains" | "desserts" | "beverages">("mains");
  const [cart, setCart] = useState<{ [itemId: string]: number }>({ m1: 2 });
  const [customerName, setCustomerName] = useState("Alex (Guest)");

  const currentTable = tables.find((t) => t.id === selectedTableId) || tables[4]; // Table 5 default
  const activeOrder = orders.find((o) => o.table_id === currentTable.id && o.status !== "completed");

  const categories = [
    { key: "mains", label: "Mains & Signature" },
    { key: "starters", label: "Starters & Small Plates" },
    { key: "desserts", label: "Artisanal Desserts" },
    { key: "beverages", label: "Cellar & Drinks" },
  ] as const;

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handlePlaceOrder = () => {
    const items = Object.entries(cart).map(([menuItemId, qty]) => ({ menuItemId, qty }));
    if (items.length === 0) return;

    placeOrder(currentTable.id, items, customerName);
    setCart({});
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Banner: Table QR Selector & AI Context */}
        <div className="glass-panel p-6 rounded-2xl border border-pulse-cyan/30 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-pulse-cyan mb-1">
              <Sparkles className="w-4 h-4 text-pulse-cyan" />
              <span>Simulated QR Scan: Table {currentTable.table_number}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              PulseOS Digital Menu & Realtime Ordering
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Live ingredient availability & kitchen load estimation updated in real time.
            </p>
          </div>

          {/* Table Switcher */}
          <div className="flex items-center space-x-2 bg-obsidian-950 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
            <span className="text-slate-400 px-2">Switch Table:</span>
            {tables.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedTableId === t.id
                    ? "bg-pulse-cyan text-obsidian-950 font-bold shadow-glow"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                T{t.table_number}
              </button>
            ))}
          </div>
        </div>

        {/* AI Smart Recommendation Badge */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-pulse-violet/20 via-pulse-cyan/20 to-transparent border border-pulse-violet/30 flex items-center space-x-3 text-xs">
          <div className="p-2 rounded-lg bg-pulse-violet/20 text-pulse-violet border border-pulse-violet/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-pulse-violet font-mono uppercase block text-[10px]">
              AI Kitchen Recommendation
            </span>
            <p className="text-slate-200">
              Low Kitchen Load on Pasta Station right now! Order <strong>Black Truffle Tagliatelle</strong> for an estimated 8-minute delivery time.
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.key
                  ? "bg-pulse-cyan text-obsidian-950 shadow-glow"
                  : "glass-pill text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems
            .filter((m) => m.category === selectedCategory)
            .map((item) => {
              const qtyInCart = cart[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-2xl border border-white/10 glass-card-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-base">{item.name}</span>
                      <span className="text-sm font-mono font-extrabold text-pulse-cyan">
                        ₹{item.price.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mb-4">
                      <Clock className="w-3 h-3 text-pulse-amber" />
                      <span>Prep Time: ~{item.prep_time_mins} min</span>
                      <span>•</span>
                      <span>Stock: {item.stock_qty} left</span>
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs font-mono text-slate-400">
                      {qtyInCart > 0 ? `${qtyInCart} in cart` : "Add to order"}
                    </span>

                    <div className="flex items-center space-x-2 bg-obsidian-950 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => updateCart(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-white">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => updateCart(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-pulse-cyan text-obsidian-950 font-bold flex items-center justify-center transition-all hover:bg-pulse-cyan/90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Live Order Tracker Banner (If Order Active) */}
        {activeOrder && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-pulse-cyan/15 via-pulse-emerald/15 to-obsidian-900 border border-pulse-cyan/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-pulse-cyan uppercase block">
                  Live Order Tracker • Order #{activeOrder.id.slice(-6)}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Status: {activeOrder.status.toUpperCase()}
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-300 bg-obsidian-950/80 px-3 py-1.5 rounded-xl border border-white/10">
                Estimated Delivery: ~12 mins
              </div>
            </div>

            {/* 4 Step Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-2 font-mono text-center text-xs">
              <div className="p-2 rounded-lg bg-pulse-emerald/20 text-pulse-emerald border border-pulse-emerald/30 font-bold">
                1. Received
              </div>
              <div className="p-2 rounded-lg bg-pulse-amber/20 text-pulse-amber border border-pulse-amber/30 font-bold animate-pulse">
                2. Kitchen Cooking
              </div>
              <div className="p-2 rounded-lg bg-obsidian-950 text-slate-500 border border-white/5">
                3. Ready
              </div>
              <div className="p-2 rounded-lg bg-obsidian-950 text-slate-500 border border-white/5">
                4. Delivered
              </div>
            </div>
          </div>
        )}

        {/* Sticky Cart Footer Bar */}
        {cartTotal > 0 && (
          <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto glass-panel p-4 rounded-2xl border border-pulse-cyan/40 bg-obsidian-900/95 backdrop-blur-xl shadow-2xl flex items-center justify-between z-40">
            <div>
              <div className="text-xs font-mono text-slate-400">Total Order Amount</div>
              <div className="text-xl font-extrabold text-white font-mono">
                ₹{cartTotal.toLocaleString()}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="px-6 py-3 rounded-xl bg-pulse-cyan text-obsidian-950 font-extrabold text-xs shadow-glow hover:bg-pulse-cyan/90 transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>PLACE ORDER (TABLE {currentTable.table_number})</span>
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
