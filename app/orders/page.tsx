"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { Panel, PanelHead, Button, Tag, StatStrip, Stat, EmptyState, cx } from "@/components/ui/primitives";
import { Order } from "@/lib/types/pulse";

type FilterTab = "All" | "Active" | "Completed" | "Cancelled";

export default function OrdersPage() {
  const { orders } = usePulseStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    return { totalOrders, totalRevenue, avgOrderValue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "Active" && !["pending", "preparing", "ready", "served"].includes(order.status)) return false;
      if (activeTab === "Completed" && order.status !== "completed") return false;
      if (activeTab === "Cancelled" && order.status !== "cancelled") return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !order.id.toLowerCase().includes(query) &&
          !order.customer_name.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["owner", "manager", "kitchen_staff"]}>
    <>
      <Navbar />
      <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-12 lg:px-12">
        <div className="mb-8">
          <div className="eyebrow mb-2">Transaction Records</div>
          <h1 className="text-[2.125rem]">Order History</h1>
        </div>

        <Panel className="mb-8 overflow-hidden">
          <StatStrip>
            <Stat label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
            <Stat label="Total Orders" value={stats.totalOrders} />
            <Stat label="Average Order Value" value={`₹${stats.avgOrderValue.toLocaleString()}`} />
          </StatStrip>
        </Panel>

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex gap-2">
            {(["All", "Active", "Completed", "Cancelled"] as FilterTab[]).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Search by ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded bg-obsidian-900 border border-line-soft pl-9 pr-3 py-2 text-sm focus:border-state-calm focus:outline-none"
            />
          </div>
        </div>

        <Panel className="overflow-hidden">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No Orders Found"
              hint="We couldn't find any orders matching your criteria."
              action={
                <Button variant="ghost" onClick={() => { setSearchQuery(""); setActiveTab("All"); }}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-line-soft">
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrderId === order.id}
                  onToggle={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                />
              ))}
            </div>
          )}
        </Panel>
      </main>
    </>
    </ProtectedRoute>
  );
}

function OrderRow({ order, isExpanded, onToggle }: { order: Order; isExpanded: boolean; onToggle: () => void }) {
  const getStatusTone = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "ok";
      case "pending":
      case "preparing":
      case "ready":
      case "served":
        return "busy";
      case "cancelled":
        return "risk";
      default:
        return "mute";
    }
  };

  const itemNames = order.items.map((i) => i.item_name).join(", ");
  const truncatedItems = itemNames.length > 40 ? itemNames.substring(0, 40) + "..." : itemNames;

  return (
    <div className="bg-obsidian-850 hover:bg-obsidian-800 transition-colors">
      <div
        className="flex cursor-pointer items-center justify-between p-5"
        onClick={onToggle}
      >
        <div className="flex flex-1 items-center gap-6">
          <div className="w-24">
            <div className="text-sm font-semibold">{order.id.substring(0, 10)}</div>
            <div className="text-xs text-ink-subtle">{order.created_at}</div>
          </div>
          <div className="w-20">
            <div className="text-xs text-ink-subtle uppercase tracking-wide">Table</div>
            <div className="text-sm font-semibold">{order.table_number}</div>
          </div>
          <div className="w-32 hidden sm:block">
            <div className="text-xs text-ink-subtle uppercase tracking-wide">Customer</div>
            <div className="text-sm">{order.customer_name}</div>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="text-sm">{order.items.length} items</div>
            <div className="text-xs text-ink-subtle truncate max-w-[200px]">{truncatedItems}</div>
          </div>
          <div className="w-24 text-right">
            <div className="text-sm font-semibold">₹{order.total_amount.toLocaleString()}</div>
          </div>
          <div className="w-24 text-right">
            <Tag tone={getStatusTone(order.status)}>{order.status}</Tag>
          </div>
        </div>
        <div className="ml-4 text-ink-subtle">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-obsidian-900 border-t border-line-soft"
          >
            <div className="p-6">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Receipt className="h-4 w-4" /> Itemized Receipt
              </h4>
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between border-b border-line-soft pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold text-ink-muted mr-2">{item.qty}x</span>
                        {item.item_name}
                      </div>
                      {item.special_instructions && (
                        <div className="text-xs text-state-busy mt-0.5">Note: {item.special_instructions}</div>
                      )}
                    </div>
                    <div className="text-sm font-semibold">₹{(item.price * item.qty).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
