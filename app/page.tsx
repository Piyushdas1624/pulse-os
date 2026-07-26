"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { LayoutGrid, Cpu, ArrowRight, ShieldCheck, Flame, UtensilsCrossed, AlertTriangle } from "lucide-react";

export default function Home() {
  const { tables, kitchenQueue, inventory, getComputedHealthScore, getComputedRiskLevel, getComputedOpportunity } = usePulseStore();

  const healthScore = getComputedHealthScore();
  const riskLevel = getComputedRiskLevel();
  const opportunity = getComputedOpportunity();

  const lowStockCount = inventory.filter((i) => i.current_stock <= i.min_threshold).length;
  const activeTickets = kitchenQueue.filter((k) => k.status === "cooking").length;

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Executive Briefing Banner */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-obsidian-900/90 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2 font-mono text-xs text-pulse-violet font-bold">
                <Cpu className="w-4 h-4 text-pulse-violet" />
                <span>EXECUTIVE OPERATIONS BRIEFING</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                Good Evening 👋 Your Restaurant is Operating Efficiently
              </h1>
            </div>

            <Link
              href="/ai-ops"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pulse-violet to-pulse-cyan text-white font-bold text-xs hover:scale-105 transition-all flex items-center space-x-2 shadow-lg self-start md:self-auto"
            >
              <span>RUN EXECUTIVE AI AUDIT</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Restaurant Health</span>
              <span className="text-xl font-extrabold text-pulse-emerald mt-1 block">{healthScore}% 🟢</span>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Risk Level</span>
              <span className={`text-xl font-extrabold mt-1 block ${riskLevel === "HIGH" ? "text-pulse-rose" : "text-pulse-cyan"}`}>
                {riskLevel}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Active Kitchen Tickets</span>
              <span className="text-xl font-extrabold text-pulse-amber mt-1 block">{activeTickets} Tickets</span>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-950/80 border border-white/5">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Stock Alerts</span>
              <span className="text-xl font-extrabold text-pulse-rose mt-1 block">{lowStockCount} Alert</span>
            </div>
          </div>
        </div>

        {/* 3-Step Guided Workflow Checkpoints */}
        <div className="space-y-4 font-sans">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-pulse-cyan" />
            Operational Checkpoints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Step 1 */}
            <Link
              href="/operations"
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-obsidian-900/90 hover:border-pulse-cyan transition-all space-y-3 block shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <span className="text-pulse-cyan font-bold text-xs uppercase">Step 1 • OBSERVE</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pulse-cyan transition-all" />
              </div>
              <h3 className="font-bold text-white text-base font-sans">2D Restaurant Floor Plan</h3>
              <p className="text-slate-400 text-xs font-sans">
                Monitor live table states, guest seating timers, and active bill amounts across Tables 1-8.
              </p>
            </Link>

            {/* Step 2 */}
            <Link
              href="/operations"
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-obsidian-900/90 hover:border-pulse-amber transition-all space-y-3 block shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <span className="text-pulse-amber font-bold text-xs uppercase">Step 2 • UNDERSTAND</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pulse-amber transition-all" />
              </div>
              <h3 className="font-bold text-white text-base font-sans">Kitchen CPU & Stock Queue</h3>
              <p className="text-slate-400 text-xs font-sans">
                Manage ticket batching across Station A Grill and monitor stock runout risk alerts.
              </p>
            </Link>

            {/* Step 3 */}
            <Link
              href="/ai-ops"
              className="glass-panel p-5 rounded-2xl border border-white/10 bg-obsidian-900/90 hover:border-pulse-violet transition-all space-y-3 block shadow-xl group"
            >
              <div className="flex items-center justify-between">
                <span className="text-pulse-violet font-bold text-xs uppercase">Step 3 • OPTIMIZE</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pulse-violet transition-all" />
              </div>
              <h3 className="font-bold text-white text-base font-sans">Executive AI Audit & Governor</h3>
              <p className="text-slate-400 text-xs font-sans">
                Review grounded AI interventions, dual explainability trees, and governor cost telemetry.
              </p>
            </Link>

          </div>
        </div>

      </main>
    </div>
  );
}
