import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { Severity, ClusterStatus } from "../types";
import { 
  AlertTriangle, 
  Share2, 
  Check, 
  Sparkles, 
  Terminal, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Circle,
  Play,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const IncidentsPanel: React.FC = () => {
  const { 
    incidents, 
    setIncidents, 
    selectedIncidentId, 
    setSelectedIncidentId,
    setClusters
  } = useOps();

  const [isRollbackExecuted, setIsRollbackExecuted] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const handleAcknowledge = () => {
    if (!activeIncident) return;
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === activeIncident.id
          ? { ...i, status: i.status === "active" ? "acknowledged" : ("active" as any) }
          : i
      )
    );
  };

  const handleExecuteRollback = async () => {
    if (!activeIncident || isExecuting) return;
    setIsExecuting(true);
    
    try {
      const response = await fetch("/api/incidents/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: activeIncident.id })
      });
      const data = await response.json();
      
      if (data.success) {
        setIsRollbackExecuted(true);
        
        // Resolve the incident and change status
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === activeIncident.id
              ? { ...i, status: "resolved" }
              : i
          )
        );

        // Restore system nodes back to healthy by fetching updated clusters from backend
        const clRes = await fetch("/api/clusters");
        const clData = await clRes.json();
        if (Array.isArray(clData)) {
          setClusters(clData);
        }
      }
    } catch (err) {
      console.error("Rollback execution failed", err);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!activeIncident) {
    return (
      <div className="text-center py-16 text-slate-500 font-mono">
        No active cluster incidents registered. Global SRE status Optimal.
      </div>
    );
  }

  const isResolved = activeIncident.status === "resolved";

  return (
    <div className="space-y-6">
      {/* Detail header control buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold flex items-center gap-1.5 border ${
              isResolved 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}></span>
              {activeIncident.status.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-slate-500">{activeIncident.id}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {activeIncident.title}
          </h1>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 text-slate-300 font-mono text-xs flex items-center gap-2 transition-colors">
            <Share2 className="w-4 h-4 text-slate-400" />
            Share logs
          </button>
          
          <button 
            disabled={isResolved}
            onClick={handleAcknowledge}
            className={`px-5 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 border transition-all ${
              isResolved 
                ? "bg-[#161a24] border-white/5 text-slate-500 cursor-not-allowed" 
                : activeIncident.status === "acknowledged"
                 ? "bg-emerald-600 border-emerald-500 text-white"
                 : "bg-[#2563eb] hover:bg-[#1d4ed8] border-[#3b82f6] text-white cursor-pointer active:scale-95"
            }`}
          >
            <Check className="w-4 h-4" />
            {activeIncident.status === "acknowledged" ? "Acknowledged" : "Acknowledge"}
          </button>
        </div>
      </div>

      {/* Bento Grid: RCA and console terminal on left, suggested fixes on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (RCA & terminal logs stream) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          {/* AI Root Cause Analysis */}
          <div className="p-6 rounded-xl border border-purple-500/20 bg-[#141225]/80 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient AI light rays */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                  AI Root Cause Analysis
                </h3>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">Confidence: 94%</span>
              </div>

              <div className="p-4 rounded-lg bg-[#0e0d1b] border border-purple-500/10 text-slate-300 space-y-3 leading-relaxed text-sm">
                <p>
                  <strong className="text-white">Telemetry Summary:</strong> {activeIncident.summary}
                </p>
                <p className="text-xs text-slate-400">
                  {activeIncident.explanation}
                </p>
                
                <div className="pt-3 border-t border-purple-500/10 flex items-center gap-1.5 text-xs text-purple-300 font-mono">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  AI-insights fully synchronized with logs.
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="rounded-xl border border-white/10 bg-[#070b13] flex-1 flex flex-col min-h-[300px] overflow-hidden">
            <div className="bg-[#121622] px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                {activeIncident.service} | tail -n 20 /var/log/app.log
              </span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/15"></span>
              </div>
            </div>

            <div className="p-4 font-mono text-xs text-slate-400 space-y-1.5 overflow-y-auto max-h-[340px] leading-relaxed flex-1">
              {activeIncident.logs.map((log, index) => (
                <div 
                  key={index}
                  className={`py-0.5 px-1.5 rounded ${
                    log.includes("[ERROR]") || log.includes("[FATAL]")
                      ? "bg-rose-500/10 text-rose-300 border-l border-rose-500" 
                      : log.includes("[WARN]")
                      ? "text-amber-300"
                      : "text-slate-400"
                  }`}
                >
                  {log}
                </div>
              ))}

              <div className="pt-2 animate-pulse text-sky-400 font-bold">
                &gt; _
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Suggested fixes / auto-heap metrics) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* suggested healing triggers */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl relative">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 pr-10">
              <RefreshCw className="w-4 h-4 text-sky-400" />
              Auto-Healing Suggestion
            </h3>

            <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-500/20 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-mono font-bold text-sky-300 uppercase">Recommended Runy</span>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Ready</span>
              </div>
              <p className="text-xs text-slate-300 leading-normal">{activeIncident.actionSuggested}</p>
              
              {isResolved ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 rounded text-center text-xs font-mono text-emerald-400 font-bold flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Incidents Resolved via Rollback!
                </div>
              ) : (
                <button
                  disabled={isExecuting}
                  onClick={handleExecuteRollback}
                  className="w-full py-2.5 bg-gradient-to-b from-purple-700 to-indigo-700 hover:brightness-110 active:brightness-95 text-white font-mono text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executing protocol Rollback...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Execute SRE Rollback
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-[11px] font-mono text-slate-400 mt-3 pl-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Auto-scaling replicas matches load (+3 pods scaled).
            </p>
          </div>

          {/* Impacted Services checklist */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4">Impacted Services Scope</h3>
            <div className="space-y-2.5">
              {activeIncident.impactedServices.map((srv, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded bg-white/5 text-xs">
                  <span className="font-mono text-slate-300">{srv.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#101423]">
                    {isResolved ? "resolved" : srv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline steps */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex-grow flex flex-col justify-between">
            <h3 className="text-base font-bold text-white mb-4">Milestone Timeline</h3>
            <div className="space-y-4 relative border-l border-white/10 pl-4 py-1 ml-2 flex-grow flex flex-col justify-around">
              {activeIncident.timeline.map((step, idx) => {
                const complete = step.status === "done" || isResolved;
                return (
                  <div key={idx} className="relative text-xs">
                    <div className={`absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full border bg-[#0f121d] flex items-center justify-center transition-colors ${
                      complete ? "border-emerald-400 text-emerald-400" : "border-slate-600 text-slate-600"
                    }`}>
                      {complete ? <Check className="w-2.5 h-2.5" /> : <div className="w-1 h-1 bg-slate-600 rounded-full"></div>}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 block">{step.time}</span>
                    <p className="text-slate-300 font-medium mt-0.5">{step.event}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
