"use client";

import Link from "next/link";
import { ArrowRight, Cpu, LayoutGrid } from "lucide-react";
import Navbar from "@/components/Navbar";
import FloorPlanSvg from "@/components/FloorPlanSvg";
import LiveEventTimeline from "@/components/LiveEventTimeline";
import KitchenCPUScheduler from "@/components/KitchenCPUScheduler";
import InventoryImpactCards from "@/components/InventoryImpactCards";
import OperationalKPIs from "@/components/OperationalKPIs";

export default function OperationsCommandCenter() {
  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 font-mono text-xs text-pulse-cyan">
              <LayoutGrid className="w-4 h-4 text-pulse-cyan" />
              <span>LAYER 1: OBSERVE & OPERATE</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Operations & Restaurant Floor Center
            </h1>
          </div>

          <Link
            href="/ai-ops"
            className="px-4 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-slate-200 hover:border-pulse-violet font-mono text-xs flex items-center space-x-2 transition-all self-start sm:self-auto"
          >
            <span>Request Executive AI Audit</span>
            <ArrowRight className="w-4 h-4 text-pulse-violet" />
          </Link>
        </div>

        {/* Operational KPIs */}
        <OperationalKPIs />

        {/* Floor Blueprint & Realtime Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FloorPlanSvg />
          </div>
          <div>
            <LiveEventTimeline />
          </div>
        </div>

        {/* Kitchen CPU Scheduler & Inventory Impact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KitchenCPUScheduler />
          <InventoryImpactCards />
        </div>
      </main>
    </div>
  );
}
