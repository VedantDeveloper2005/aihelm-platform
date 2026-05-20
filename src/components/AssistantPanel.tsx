import React, { useState, useRef, useEffect } from "react";
import { useOps } from "../context/OperationalContext";
import { ChatMessage, ViewType } from "../types";
import { 
  Send, 
  Sparkles, 
  User, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Paperclip, 
  Terminal, 
  Play, 
  Loader2,
  Trash2,
  HelpCircle,
  Eye,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AssistantPanel: React.FC = () => {
  const { 
    chatHistory, 
    addChatMessage, 
    clearChatHistory, 
    clusters, 
    incidents,
    setView,
    setSelectedIncidentId
  } = useOps();

  const [inputQuery, setInputQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendChat = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    addChatMessage(userMsg);
    setInputQuery("");
    setIsSending(true);

    try {
      // Proxy chat payload to server-side Gemini gateway
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-10).map(msg => ({ role: msg.role, content: msg.content }))
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `chat-ai-${Date.now()}`,
        role: "assistant",
        content: data.response || "No diagnostic traceback matched.",
        timestamp: new Date()
      };

      // In-line interactive SRE controls injection triggers
      if (text.toLowerCase().includes("outage") || text.toLowerCase().includes("crash") || text.toLowerCase().includes("oom")) {
        assistantMsg.fixes = [
          { label: "Run Auto-Heal (Rollback)", action: "rollback" },
          { label: "Grep Live Logs", action: "logs" }
        ];
      }

      addChatMessage(assistantMsg);
    } catch (err) {
      console.error("Diagnostic Chat Protocol failed:", err);
      addChatMessage({
        id: `chat-err-${Date.now()}`,
        role: "assistant",
        content: "**Traceback Error Exception:** Connection timed out when verifying SRE target queries.",
        timestamp: new Date()
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFixAction = (action: string) => {
    if (action === "rollback") {
      setSelectedIncidentId("INC-2024-089");
      setView(ViewType.INCIDENTS);
    } else if (action === "logs") {
      setView(ViewType.LOGS);
    }
  };

  const PROMPT_SUGGESTIONS = [
    { label: "Analyze today's outage", icon: AlertTriangle, color: "text-rose-400" },
    { label: "Why are frontend pods crashing?", icon: Terminal, color: "text-purple-400" },
    { label: "Show cluster resource spikes", icon: Activity, color: "text-sky-400" }
  ];

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6 relative select-none">
      
      {/* Primary chat canvas workspace */}
      <div className="flex-1 flex flex-col rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl overflow-hidden relative">
        {/* Floating actions container */}
        <div className="bg-[#121622] px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            AIHelm Cognitive diagnostic channel
          </div>
          <button 
            onClick={clearChatHistory}
            className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-rose-400 transition-colors" 
            title="Clear Chat history context"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rolling Messages window */}
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-4 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Profile icon indicators */}
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "user" 
                  ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                  : "bg-purple-500/15 border-purple-500/25 text-purple-300"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className="space-y-3 min-w-0">
                <div className={`p-4 rounded-xl border leading-relaxed text-sm ${
                  msg.role === "user"
                    ? "bg-[#1f2430] border-white/10 text-white rounded-tr-none"
                    : "bg-[#161427]/60 border-purple-500/10 text-slate-300 rounded-tl-none whitespace-pre-wrap"
                }`}>
                  {msg.content}
                </div>

                {/* Inline suggested triggers helper */}
                {msg.fixes && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {msg.fixes.map((fix, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFixAction(fix.action)}
                        className="px-3.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono font-medium hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        {fix.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pending Gemini API loading state indicator spinner */}
          {isSending && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full border bg-purple-500/15 border-purple-500/25 text-purple-300 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              </div>
              <div className="p-4 rounded-xl border bg-[#161427]/60 border-purple-500/10 text-slate-400 text-xs font-mono flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                AIHelm matching system traceback trace graphs...
              </div>
            </div>
          )}

          {/* Prompt Suggestions layer */}
          {!isSending && chatHistory.length <= 1 && (
            <div className="flex flex-wrap gap-3 pt-4 pl-12">
              {PROMPT_SUGGESTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(item.label)}
                    className="px-3.5 py-2 rounded-lg border border-white/5 bg-[#171b26]/50 hover:bg-[#1a2133] hover:border-sky-500/30 text-xs font-mono text-slate-400 hover:text-sky-300 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 group"
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.color} group-hover:scale-105 transition-transform`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User prompt typing form bar details */}
        <div className="p-4 border-t border-white/5 bg-[#121622]/80 backdrop-blur-md">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat(inputQuery);
            }} 
            className="flex items-end gap-2 p-2 rounded-xl border border-white/10 bg-[#0e111b] focus-within:border-sky-500/50 transition-colors"
          >
            <button 
              type="button" 
              className="p-2 text-slate-500 hover:text-sky-400 transition-colors" 
              title="Attach configuration trace JSON"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat(inputQuery);
                }
              }}
              placeholder="> Prompt AIHelm to analyze telemetry, trace graphs, index patterns or apply runbooks..."
              className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 text-sm font-mono py-1.5 resize-none outline-none leading-relaxed"
              style={{ minHeight: "40px" }}
            />
            <button
              type="submit"
              disabled={isSending || !inputQuery.trim()}
              className="p-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-[#1c2231] disabled:text-slate-500 text-[#090d16] rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center text-[10px] text-slate-500 font-mono mt-2">
            AI can make mistakes. Triple-check SRE playbook execution triggers in production environments.
          </div>
        </div>
      </div>

      {/* Observability inspection sidebar panel */}
      <aside className="hidden xl:flex flex-col w-72 p-4 bg-[#121622]/40 rounded-xl border border-white/10 overflow-y-auto text-xs space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="font-mono uppercase font-bold text-slate-400 tracking-wider">Active SRE Scope</span>
          <button className="text-slate-500 hover:text-white transition-colors" title="Select cluster node config">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target scopes metrics values */}
        <div className="p-3.5 bg-sky-500/5 border border-sky-500/10 rounded-lg text-sky-400 space-y-2">
          <div className="flex items-center gap-2 border-b border-sky-500/10 pb-1.5">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping"></span>
            <span className="font-mono font-bold">us-east-1-prod</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10.5px]">
            <div className="flex justify-between">Nodes count: <span className="text-white font-semibold">42 Cluster</span></div>
            <div className="flex justify-between">Running pods: <span className="text-white font-semibold">341 active</span></div>
            <div className="flex justify-between">Current status: <span className="text-rose-400 font-semibold font-mono animate-pulse">1 Critical</span></div>
          </div>
        </div>

        {/* live dashboard gauges */}
        <div className="space-y-3.5">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Live Metrics (Cluster)</span>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-1"><Cpu className="w-3 h-3 text-sky-400" /> CPU Load</span>
              <span className="text-white font-semibold">68%</span>
            </div>
            <div className="w-full h-1.5 bg-[#171a24] rounded-full overflow-hidden">
              <div className="bg-sky-400 h-full w-[68%] rounded-full"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3 text-rose-400" /> Memory Load</span>
              <span className="text-rose-400 font-semibold font-mono">94%</span>
            </div>
            <div className="w-full h-1.5 bg-[#171a24] rounded-full overflow-hidden">
              <div className="bg-rose-400 h-full w-[94%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Recent anomalies cards list */}
        <div className="space-y-2.5">
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Recent Anomalies</span>

          <div 
            onClick={() => handleSendChat("Why are frontend pods crashing with OOMKilled events?")}
            className="p-2.5 bg-[#131725] hover:bg-[#1a2133] transition-colors border border-white/5 rounded duration-200 cursor-pointer flex gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-slate-200 font-medium">OOMKilled Event</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">frontend-prod • 2m ago</p>
            </div>
          </div>

          <div 
            onClick={() => handleSendChat("Show high latency spikes and database analytics.")}
            className="p-2.5 bg-[#131725] hover:bg-[#1a2133] transition-colors border border-white/5 rounded duration-200 cursor-pointer flex gap-2"
          >
            <Activity className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-slate-200 font-medium">High Latency Spike</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">api-gateway • 15m ago</p>
            </div>
          </div>
        </div>

      </aside>

    </div>
  );
};
