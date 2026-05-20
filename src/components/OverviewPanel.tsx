import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { ViewType, ClusterStatus, Severity } from "../types";
import { 
  Activity, 
  Layers, 
  Server, 
  AlertTriangle, 
  Terminal, 
  Play, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  Database,
  Sparkles,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const OverviewPanel: React.FC = () => {
  const { 
    clusters, 
    incidents, 
    isOptimizationApplied, 
    applyOptimization, 
    setSelectedIncidentId, 
    setView,
    currentView
  } = useOps();

  const [activeTopologyNode, setActiveTopologyNode] = useState<string | null>(null);

  const getStatusColor = (status: ClusterStatus) => {
    switch (status) {
      case ClusterStatus.HEALTHY: return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case ClusterStatus.DEGRADED: return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case ClusterStatus.CRITICAL: return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    }
  };

  // Mock topology state descriptors
  const topologyDetails: Record<string, { desc: string; cpu: string; mem: string; state: string }> = {
    "api-1": { desc: "External REST Ingress Controller", cpu: "42%", mem: "51%", state: "Healthy" },
    "api-2": { desc: "GraphQL GraphQL Handler", cpu: "38%", mem: "49%", state: "Healthy" },
    "auth-err": { desc: "Authed Credentials Validator", cpu: "92%", mem: "98%", state: "Auth connection limit leaked" },
    "web-1": { desc: "NexaCorp Primary Web Client", cpu: "51%", mem: "62%", state: "Healthy" },
    "web-2": { desc: "Web UI Backup server", cpu: "12%", mem: "30%", state: "Healthy" },
    "db-0": { desc: "PostgreSQL Production Master", cpu: "78%", mem: "84%", state: "Healthy" },
    "db-1-lag": { desc: "PostgreSQL replica synchronization lag", cpu: "95%", mem: "82%", state: "Replication mismatch lag" },
    "cache": { desc: "Redis In-memory Context store", cpu: "30%", mem: "44%", state: "Healthy" }
  };

  return (
    <div className="space-y-6">
      {/* Global Cluster Health & Active Incidents Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Global Cluster Health */}
        <div className="xl:col-span-8 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl">
          <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Global Cluster Health
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#171c2a] border border-white/5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">Total Pods</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold font-mono text-sky-300">1,248</span>
                <span className="text-xs font-mono text-emerald-400 mb-1">98% Clean</span>
              </div>
              <div className="w-full bg-[#20273a] h-1.5 mt-4 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full w-[98%] rounded-full"></div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#171c2a] border border-white/5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">Active Nodes</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold font-mono text-white">64</span>
                <span className="text-xs font-mono text-rose-400 mb-1">2 Degraded</span>
              </div>
              <div className="w-full bg-[#20273a] h-1.5 mt-4 rounded-full overflow-hidden flex gap-0.5">
                <div className="bg-emerald-400 h-full flex-grow"></div>
                <div className="bg-emerald-400 h-full flex-grow"></div>
                <div className="bg-rose-400 h-full w-3"></div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#171c2a] border border-white/5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">Services</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold font-mono text-white">312</span>
                <span className="text-xs font-mono text-sky-400 mb-1">All Operational</span>
              </div>
              <div className="w-full bg-[#20273a] h-1.5 mt-4 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full w-full rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="xl:col-span-4 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Active Incidents
            </h2>
            <span className="px-2 py-0.5 rounded-full font-mono text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {incidents.filter(i => i.status !== "resolved").length} Active
            </span>
          </div>

          <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
            {incidents.filter(i => i.status !== "resolved").map((inc) => (
              <div 
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setView(ViewType.INCIDENTS);
                }}
                className="p-3 rounded bg-[#171c2a] border-l-2 border-rose-500 hover:bg-[#20273a] transition-colors cursor-pointer flex gap-3 items-start"
              >
                <div className="p-1 rounded bg-[#2c1a22] text-rose-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-semibold text-white truncate">{inc.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">{inc.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{inc.service} • {inc.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Topology, AI Cost saving, and sparkline metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Recommendation & K8s Topology hex map */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          {/* AI Optimizer available card */}
          <div className="p-5 rounded-xl border border-purple-500/30 bg-[#161327]/80 backdrop-blur-md relative overflow-hidden group">
            {/* Ambient pulse shadow indicator */}
            <div className="absolute inset-0 bg-purple-500/5 pulse-border rounded-xl pointer-events-none"></div>

            <div className="flex gap-4 items-start relative z-10">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-300 border border-purple-500/30 shrink-0">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                  AI Optimization recommendation
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold bg-purple-500/20 text-purple-200 rounded">Available</span>
                </h3>
                <p className="text-sm text-slate-300 leading-normal">
                  Identified 6 underutilized virtual worker instances in <span className="font-mono text-purple-300">cluster-us-east-1</span>. Scaling down worker replications will cut monthly cloud expenditure by <span className="font-mono text-emerald-400 font-semibold">$420/month</span> without compromising SLAs.
                </p>

                <div className="flex gap-3 pt-1">
                  {isOptimizationApplied ? (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Applied Optimization — Saving $420/month
                    </span>
                  ) : (
                    <>
                      <button 
                        onClick={applyOptimization}
                        className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs rounded transition-all shadow-[0_2px_10px_rgba(147,51,234,0.3)] hover:-translate-y-0.5"
                      >
                        Apply Optimization
                      </button>
                      <button 
                        onClick={() => setView(ViewType.SETTINGS)}
                        className="px-4 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs rounded transition-colors"
                      >
                        View Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kubernetes topology visual card */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                Kubernetes Topology Network
              </h2>
              <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-sky-500/30 border border-sky-400"></span>
                  Healthy
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-400"></span>
                  Degraded
                </span>
              </div>
            </div>

            <div className="p-6 bg-[#0a0d17] border border-white/5 rounded-lg flex flex-col md:flex-row items-center justify-around gap-6 relative min-h-[220px]">
              {/* Mesh Network Grid details background overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>

              <div className="flex flex-wrap gap-4 justify-center items-center w-full max-w-md relative z-10">
                {Object.keys(topologyDetails).map((key) => {
                  const s = topologyDetails[key];
                  const isLagOrErr = key.includes("err") || key.includes("lag");
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTopologyNode(activeTopologyNode === key ? null : key)}
                      className={`relative w-24 h-11 flex items-center justify-center font-mono text-[11px] font-semibold tracking-wide border rounded transition-all transform cursor-pointer hover:scale-105 active:scale-95 ${
                        isLagOrErr
                          ? "bg-rose-950/20 hover:bg-rose-900/30 border-rose-500/40 text-rose-300"
                          : "bg-sky-950/20 hover:bg-sky-900/30 border-sky-500/40 text-sky-300"
                      } ${activeTopologyNode === key ? "ring-2 ring-primary ring-offset-2 ring-offset-black scale-105" : ""}`}
                    >
                      {key}
                      {isLagOrErr && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Topology live inspection sidebar drawer details info */}
              <div className="w-full md:w-56 p-4 rounded bg-[#101423] border border-white/5 relative z-10 flex flex-col justify-center min-h-[140px] text-xs">
                <AnimatePresence mode="wait">
                  {activeTopologyNode ? (
                    <motion.div
                      key={activeTopologyNode}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span className="font-mono text-sky-300 font-bold uppercase">{activeTopologyNode}</span>
                        <span className={`px-1 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                          activeTopologyNode.includes("err") || activeTopologyNode.includes("lag") ? "text-rose-400 bg-rose-500/10" : "text-sky-400 bg-sky-500/10"
                        }`}>
                          {topologyDetails[activeTopologyNode].state}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-normal">{topologyDetails[activeTopologyNode].desc}</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                        <div>CPU: <span className="text-white font-semibold">{topologyDetails[activeTopologyNode].cpu}</span></div>
                        <div>Mem: <span className="text-white font-semibold">{topologyDetails[activeTopologyNode].mem}</span></div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center text-slate-500 py-6 space-y-1">
                      <HelpCircle className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                      <p>Click pod node</p>
                      <p className="text-[10px]">to inspect deployment</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Observability terminals with live avg charts */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex-1 flex flex-col justify-between">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-sky-400" />
              Resource Utilization averages
            </h2>

            <div className="p-4 bg-[#05070e] border border-white/5 rounded-lg flex-1 flex flex-col justify-between font-mono text-xs leading-relaxed text-slate-400">
              <div className="text-sky-300/80 border-b border-white/5 pb-2 mb-4">
                &gt; watch kubectl top nodes --sort-by='cpu'
              </div>

              {/* Simulated sparklines charts */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white font-medium">CPU Cluster Avg</span>
                    <span className="text-sky-400 font-bold font-mono">68%</span>
                  </div>
                  <div className="h-16 w-full flex items-end gap-1 select-none">
                    <div className="bg-sky-400/20 hover:bg-sky-400/40 w-full h-[30%] transition-colors duration-200"></div>
                    <div className="bg-sky-400/20 hover:bg-sky-400/40 w-full h-[40%] transition-colors duration-200"></div>
                    <div className="bg-sky-400/20 hover:bg-sky-400/40 w-full h-[35%] transition-colors duration-200"></div>
                    <div className="bg-sky-400/20 hover:bg-sky-400/40 w-full h-[60%] transition-colors duration-200"></div>
                    <div className="bg-sky-400/30 hover:bg-sky-400/50 w-full h-[50%] transition-colors duration-200"></div>
                    <div className="bg-sky-400/40 hover:bg-sky-400/60 w-full h-[80%] transition-colors duration-200"></div>
                    <div className="bg-sky-400/50 hover:bg-sky-400/70 w-full h-[68%] transition-colors duration-200 relative">
                      <span className="absolute -top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white font-medium">Memory Cluster Avg</span>
                    <span className="text-purple-400 font-bold font-mono">82%</span>
                  </div>
                  <div className="h-16 w-full flex items-end gap-1 select-none">
                    <div className="bg-purple-400/20 hover:bg-purple-400/40 w-full h-[70%] transition-colors duration-200"></div>
                    <div className="bg-purple-400/20 hover:bg-purple-400/40 w-full h-[72%] transition-colors duration-200"></div>
                    <div className="bg-purple-400/30 hover:bg-purple-400/50 w-full h-[75%] transition-colors duration-200"></div>
                    <div className="bg-purple-400/30 hover:bg-purple-400/50 w-full h-[74%] transition-colors duration-200"></div>
                    <div className="bg-purple-400/40 hover:bg-purple-400/60 w-full h-[78%] transition-colors duration-200"></div>
                    <div className="bg-purple-400/40 hover:bg-purple-400/60 w-full h-[80%] transition-colors duration-200"></div>
                    <div className="bg-purple-400/50 hover:bg-purple-400/70 w-full h-[82%] transition-colors duration-200"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-slate-500 font-bold uppercase">
                <span>[ <span className="text-sky-300">NODE-01: 92% CPU</span> ]</span>
                <span>[ <span className="text-purple-300">NODE-04: 98% MEM</span> ]</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
