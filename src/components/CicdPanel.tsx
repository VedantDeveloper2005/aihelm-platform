import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { 
  GitBranch, 
  Check, 
  ArrowRight, 
  History, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  Play,
  Settings,
  ChevronDown,
  Activity,
  Award,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const CicdPanel: React.FC = () => {
  const { pipelineStages, setPipelineStages, rollbackHistory } = useOps();
  const [isPromoted, setIsPromoted] = useState<boolean>(false);
  const [isPromoting, setIsPromoting] = useState<boolean>(false);

  // Promoting release candidate to Prod
  const handlePromoteToProd = () => {
    setIsPromoting(true);
    setTimeout(() => {
      setIsPromoting(false);
      setIsPromoted(true);

      // Advanced pipeline phases resolution
      setPipelineStages((prev) =>
        prev.map((p) =>
          p.id === "st-3" 
            ? { ...p, status: "done", duration: "2m 14s" }
            : p.id === "st-4"
            ? { ...p, status: "done", duration: "12s" }
            : p
        )
      );
    }, 2000);
  };

  const getStageIcon = (status: "done" | "running" | "pending") => {
    switch (status) {
      case "done":
        return <Check className="w-4 h-4 text-emerald-400" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />;
      case "pending":
        return <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Canvas Row */}
      <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl">
        <div className="flex justify-between items-baseline mb-6 border-b border-white/5 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-sky-400" />
            Active Release Delivery pipeline
          </h2>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Release Branch: master</span>
        </div>

        {/* Horizontal steps flow */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 relative">
          {pipelineStages.map((stage, idx) => {
            const isActive = stage.status === "running";
            const isCompleted = stage.status === "done";

            return (
              <React.Fragment key={stage.id}>
                <div 
                  className={`flex-1 p-4 rounded-xl border flex flex-col justify-between min-h-[90px] w-full transition-all ${
                    isActive 
                      ? "bg-[#181a30] border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.15)] scale-[1.02]" 
                      : isCompleted 
                      ? "bg-[#141d27]/40 border-emerald-500/25" 
                      : "bg-[#141724]/30 border-white/5 opacity-55"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-300 font-mono">{stage.name}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isActive 
                        ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                        : isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-[#1b2031] border-white/5"
                    }`}>
                      {getStageIcon(stage.status)}
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mt-4 text-[10px] font-mono">
                    <span className="text-slate-500">Duration:</span>
                    <span className={isActive ? "text-sky-400 animate-pulse" : "text-white"}>{stage.duration}</span>
                  </div>
                </div>

                {idx < pipelineStages.length - 1 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-slate-600 shrink-0 select-none mx-2" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Trust promotions & rollbacks indices box */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Production promotions guidelines controls (5 cols) */}
        <div className="xl:col-span-5 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Production promotion controls
            </h3>
            <p className="text-xs text-slate-400">Release candidate validation thresholds.</p>
          </div>

          <div className="p-4 bg-[#141225]/40 rounded-lg border border-purple-500/15 space-y-4 my-4">
            <div className="flex justify-between items-baseline font-mono text-xs">
              <span className="text-slate-400 uppercase font-semibold">Active RC version</span>
              <span className="text-purple-300 font-bold">v4.3.0-rc.2</span>
            </div>

            <div className="flex justify-between items-center bg-[#131021] border border-purple-500/10 p-3.5 rounded">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Release Trust score</span>
                <div className="text-xl font-extrabold font-mono text-purple-300">98 / 100</div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded uppercase font-bold">SLA Compliant</span>
            </div>

            {isPromoted ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-mono text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                Promoted to master successfully!
              </div>
            ) : (
              <button 
                disabled={isPromoting}
                onClick={handlePromoteToProd}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isPromoting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Promoting RC.2 channels...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Promote RC.2 Deployment to production
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-[11px] font-mono text-slate-500 pl-2">
            * Promotion runs automatic end-to-end integration metrics scans before promoting.
          </p>
        </div>

        {/* Automatic Rollbacks database indicators (7 cols) */}
        <div className="xl:col-span-7 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-rose-400" />
              Automatic Rollbacks & Root Causes log
            </h3>
            <span className="text-xs font-mono text-slate-500">History: 30 days</span>
          </div>

          {/* Records lists */}
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {rollbackHistory.map((rec) => (
              <div 
                key={rec.id}
                className="p-3.5 rounded bg-white/5 border border-white/5 flex flex-col justify-between gap-2 text-xs"
              >
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[9px] font-bold">
                      {rec.trigger}
                    </span>
                    <span className="font-bold text-slate-200 font-mono">{rec.deployment}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{rec.date}</span>
                </div>
                <p className="text-slate-400 line-clamp-2 leading-relaxed">
                  <strong className="text-white">Reason:</strong> {rec.rootCause}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
