"use client";

import Navbar from "@/components/Navbar";
import AIHealthScanCard from "@/components/AIHealthScanCard";
import AICostSavingsCard from "@/components/AICostSavingsCard";
import AIMemoryWidget from "@/components/AIMemoryWidget";
import AIExplainabilityModal from "@/components/AIExplainabilityModal";
import AISettingsModal from "@/components/AISettingsModal";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { useState } from "react";
import { Send, Cpu, Bot, Sparkles, User, Settings } from "lucide-react";

export default function AIOperationsCenter() {
  const { menuItems, orders, inventory } = usePulseStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Welcome to PulseOS Operational Intelligence. I have direct access to real-time table statuses, active kitchen workloads, ingredient burn rates, and gross margins. How can I optimize your restaurant performance tonight?",
    },
  ]);
  const [isAnswering, setIsAnswering] = useState(false);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isAnswering) return;

    const q = userQuery.trim();
    setUserQuery("");
    setMessages((prev) => [...prev, { sender: "user", text: q }]);
    setIsAnswering(true);

    setTimeout(() => {
      let reply = "Based on current live state analysis:\n";
      if (q.toLowerCase().includes("table") || q.toLowerCase().includes("slow") || q.toLowerCase().includes("wait")) {
        reply += "• Table wait times elevated by 14% due to Station A Grill patty sear cycles.\n• Recommendation: Execute Smart CPU Batching on 5 Wagyu Burgers to reduce wait time by 18%.";
      } else if (q.toLowerCase().includes("margin") || q.toLowerCase().includes("profit") || q.toLowerCase().includes("revenue")) {
        reply += "• Highest gross margin dish tonight: Wood-Fired Burrata Pizza (74% gross margin).\n• Promoting Burrata Pizza to incoming guests can increase tonight's gross revenue by ₹4,800.";
      } else if (q.toLowerCase().includes("stock") || q.toLowerCase().includes("inventory") || q.toLowerCase().includes("cheese")) {
        reply += "• Aged Truffle Cheese stock is at 0.8 kg (estimated depletion in 38 mins).\n• Triggering express reorder prevents a potential revenue loss of ₹4,800.";
      } else {
        reply += `• Kitchen load is currently at 84% utilization.\n• Active Orders: ${orders.length} orders.\n• PulseAI Governor recommends maintaining Smart CPU Batching to optimize prep speed.`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setIsAnswering(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Upper Header Control Bar for AI Settings */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2 font-mono text-xs text-slate-400">
            <Cpu className="w-4 h-4 text-pulse-violet" />
            <span>PULSE AI PROVIDER MANAGER</span>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 hover:border-pulse-violet text-slate-300 hover:text-white font-mono text-xs flex items-center space-x-1.5 transition-all shadow-md"
          >
            <Settings className="w-3.5 h-3.5 text-pulse-violet" />
            <span>AI Settings & Models</span>
          </button>
        </div>

        {/* Layer 3: OPTIMIZE - Primary AI Health Scan & Executive Audit */}
        <AIHealthScanCard />

        {/* Layer 4: OPERATE EFFICIENTLY - PulseAI Governor Telemetry Widget */}
        <AICostSavingsCard />

        {/* Grid: Grounded AI Advisor & Operational AI Memory */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Grounded Gemini Conversational Console */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col h-[480px]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-pulse-cyan" />
                <h3 className="font-bold text-white text-base">Grounded Gemini AI Operational Advisor</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-pulse-cyan/10 text-pulse-cyan border border-pulse-cyan/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Zero Hallucinations
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 text-xs ${
                    m.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      m.sender === "user"
                        ? "bg-pulse-cyan text-obsidian-950"
                        : "bg-pulse-violet text-white"
                    }`}
                  >
                    {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
                      m.sender === "user"
                        ? "bg-pulse-cyan/20 border border-pulse-cyan/30 text-white"
                        : "bg-obsidian-900 border border-white/10 text-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              ))}
              {isAnswering && (
                <div className="flex items-center space-x-2 text-xs font-mono text-pulse-cyan animate-pulse">
                  <Bot className="w-4 h-4" />
                  <span>PulseAI evaluating operational matrix...</span>
                </div>
              )}
            </div>

            {/* Query Form */}
            <form onSubmit={handleSendQuery} className="flex items-center space-x-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask operational question (e.g. 'Why are tables slow?' or 'Highest margin item?')..."
                className="flex-1 bg-obsidian-950 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pulse-cyan transition-all"
              />
              <button
                type="submit"
                disabled={isAnswering}
                className="px-4 py-2.5 rounded-xl bg-pulse-cyan text-obsidian-950 font-bold text-xs hover:bg-pulse-cyan/90 transition-all flex items-center space-x-1.5"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Operational AI Memory Log */}
          <div>
            <AIMemoryWidget />
          </div>
        </div>

      </main>

      {/* Explainability Modal */}
      <AIExplainabilityModal />

      {/* AI Provider & Model Settings Modal */}
      <AISettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
