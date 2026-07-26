"use client";

import Navbar from "@/components/Navbar";
import AISettingsModal from "@/components/AISettingsModal";
import { useState } from "react";
import { Cpu, Server, ShieldCheck, Sparkles, Key, CheckCircle2, AlertCircle, RefreshCw, Layers, Table as TableIcon } from "lucide-react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { AIProviderType, AIProviderMode } from "@/lib/types/pulse";

export default function SettingsPage() {
  const { governor } = usePulseStore();
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-pulse-violet">
              <Cpu className="w-4 h-4 text-pulse-violet" />
              <span>PULSEOS ENTERPRISE INFRASTRUCTURE</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              AI Settings & Infrastructure Manager
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pulse-violet to-pulse-cyan text-white font-bold text-xs hover:scale-105 transition-all shadow-lg"
          >
            OPEN FULL INFRASTRUCTURE MANAGER
          </button>
        </div>

        <AISettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
}
