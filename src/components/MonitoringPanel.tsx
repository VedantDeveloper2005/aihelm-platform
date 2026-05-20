import React from "react";
import { useOps } from "../context/OperationalContext";
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  HelpCircle,
  BarChart2,
  ListFilter,
  Eye,
  CheckCircle2,
  Heart,
  Sliders,
  Sparkles
} from "lucide-react";

export const MonitoringPanel: React.FC = () => {
  const { complianceScore } = useOps();

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* System Health */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 text-emerald-400/20">
            <Heart className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">System Health</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-lg font-bold text-white uppercase font-mono">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-3">All systems running normally.</p>
        </div>

        {/* Active Alerts */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 text-amber-400/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Active Warnings</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-amber-400">2</span>
            <span className="text-[11px] font-mono text-slate-400">Triggers active</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-3">Up +1 warning in the last hour.</p>
        </div>

        {/* P99 Value */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 text-sky-400/20">
            <Clock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">P99 Latency</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-sky-300">42.8 ms</span>
            <span className="text-[10px] font-mono text-emerald-400">-1.2ms</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-3">SLA compliance value at 100%.</p>
        </div>

        {/* Threat compliance */}
        <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 text-purple-400/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">DevSecOps Compliance</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-purple-300">{complianceScore}%</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-3">Active NIST vulnerability patches.</p>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* P99 Latency Line Chart (8 cols) */}
        <div className="xl:col-span-8 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between min-h-[360px] relative group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                P99 Latency graph
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" title="99th percentile across federated cluster routers.">
                  P99 Metric Info
                </HelpCircle>
              </h2>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-sky-300">42.8 ms</span>
                <span className="text-xs font-mono text-emerald-400">-1.2ms</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="p-1 rounded text-slate-400 hover:bg-white/5 transition-colors"><Sliders className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Line Chart drawing using HTML area + SVG neon paths */}
          <div className="flex-1 relative w-full border-l border-b border-white/10 flex items-end pt-8 pb-1 pr-2">
            
            {/* Grid Helper lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.05] py-2">
              <div className="border-t border-white border-dashed w-full h-0"></div>
              <div className="border-t border-white border-dashed w-full h-0"></div>
              <div className="border-t border-white border-dashed w-full h-0"></div>
              <div className="border-t border-white border-dashed w-full h-0"></div>
            </div>

            {/* Y axis indicators */}
            <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono text-slate-500 py-2">
              <span>100ms</span>
              <span>75ms</span>
              <span>50ms</span>
              <span>25ms</span>
              <span>0</span>
            </div>

            {/* Dynamic line vector */}
            <div className="w-full h-[65%] relative">
              {/* Gradient fill clip */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-sky-400/10 via-sky-400/5 to-transparent opacity-60" 
                style={{ clipPath: "polygon(0 100%, 0 60%, 10% 50%, 20% 70%, 30% 40%, 40% 64%, 50% 30%, 60% 43%, 70% 18%, 80% 52%, 90% 8%, 100% 32%, 100% 100%)" }}
              ></div>

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path 
                  d="M0,60 L10,50 L20,70 L30,40 L40,64 L50,30 L60,43 L70,18 L80,52 L90,8 L100,32" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]"
                />
                
                {/* Active pulsating beacon */}
                <circle cx="100" cy="32" r="2.5" fill="#121622" stroke="#38bdf8" strokeWidth="1.5" className="animate-pulse"></circle>
              </svg>
            </div>

            {/* AI Overlay indicator spikes */}
            <div className="absolute left-[70%] top-[10%] bottom-0 border-l border-purple-500 border-dashed opacity-40 pointer-events-none group-hover:opacity-100 transition-opacity">
              <div className="absolute top-0 left-2 bg-[#201533]/80 border border-purple-500/30 text-[9px] font-mono px-2 py-0.5 rounded text-purple-300 backdrop-blur-sm whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Spike Detected (JWT leak)
              </div>
            </div>

          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>-60 minutes</span>
            <span>Now</span>
          </div>
        </div>

        {/* Error rate bar chart graph metrics (4 cols) */}
        <div className="xl:col-span-4 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Error Rate (5xx average)</h3>
            <span className="text-2xl font-bold font-mono text-rose-400">0.14%</span>
          </div>

          {/* Bar charts blocks layout */}
          <div className="flex-grow flex items-end gap-2 pt-6 border-b border-white/10 pb-1 mt-4">
            <div className="w-full bg-rose-500/10 hover:bg-rose-500/30 transition-colors h-[10%] rounded-t-sm relative group">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#121622] text-on-surface border border-white/5 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">0.02%</span>
            </div>
            <div className="w-full bg-rose-500/10 hover:bg-rose-500/30 transition-colors h-[15%] rounded-t-sm"></div>
            <div className="w-full bg-rose-500/10 hover:bg-rose-500/30 transition-colors h-[8%] rounded-t-sm"></div>
            <div className="w-full bg-rose-500/35 hover:bg-rose-500/50 transition-colors h-[48%] rounded-t-sm relative border-t-2 border-rose-500">
              {/* Leaked anomaly spike */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#201217] text-rose-300 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono">0.68%</span>
            </div>
            <div className="w-full bg-rose-500/10 hover:bg-rose-500/30 transition-colors h-[22%] rounded-t-sm"></div>
            <div className="w-full bg-rose-500/10 hover:bg-rose-500/30 transition-colors h-[14%] rounded-t-sm"></div>
            <div className="w-full bg-rose-500/10 hover:bg-rose-500/30 transition-colors h-[5%] rounded-t-sm"></div>
            <div className="w-full bg-rose-500/15 hover:bg-rose-500/25 transition-colors h-[20%] rounded-t-sm"></div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>-60 minutes</span>
            <span>Now</span>
          </div>
        </div>

      </div>
    </div>
  );
};
