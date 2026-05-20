import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { 
  Terminal, 
  Search, 
  Trash2, 
  X, 
  ChevronDown, 
  Sparkles,
  BarChart2,
  AlertTriangle,
  Play,
  Pause,
  Filter,
  Eye
} from "lucide-react";

export const LogsPanel: React.FC = () => {
  const { activeLogs, logFilters, setLogFilters } = useOps();
  const [grepInput, setGrepInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);

  // Filters logic
  const filteredLogs = activeLogs.filter((log) => {
    // Grep search
    if (grepInput && !log.message.toLowerCase().includes(grepInput.toLowerCase()) && !log.level.toLowerCase().includes(grepInput.toLowerCase())) {
      return false;
    }
    // Filter service
    if (logFilters.service !== "All" && log.service !== logFilters.service) {
      return false;
    }
    return true;
  });

  const uniqueServices = ["All", ...Array.from(new Set(activeLogs.map((l) => l.service)))];

  return (
    <div className="space-y-6">
      {/* CLI Grep filter bar controls */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row gap-4 w-full">
          {/* CLI GREP */}
          <div className="flex-1 flex items-center bg-[#090d16] border border-white/10 focus-within:border-sky-500 rounded-lg px-3 transition-colors shadow-inner">
            <span className="font-mono text-sky-400 font-bold mr-2">&gt;</span>
            <span className="font-mono text-purple-400 mr-2">grep</span>
            <input 
              type="text" 
              value={grepInput}
              onChange={(e) => setGrepInput(e.target.value)}
              placeholder="'Error parsing JSON' || Level: ERROR/WARN" 
              className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-500 font-mono text-xs py-2"
            />
            {grepInput && (
              <button onClick={() => setGrepInput("")} className="text-slate-500 hover:text-white mr-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
          </div>

          {/* Filtering selectors dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            <div className="flex items-center gap-1 bg-[#121622] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono">Service:</span>
              <select 
                value={logFilters.service} 
                onChange={(e) => setLogFilters({ ...logFilters, service: e.target.value })}
                className="bg-transparent border-none text-sky-300 font-bold font-mono focus:outline-none text-xs p-0 cursor-pointer ml-1 select-none"
              >
                {uniqueServices.map((srv) => (
                  <option key={srv} value={srv} className="bg-[#121622] text-slate-200">{srv}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#121622] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <span className="font-mono">Time:</span>
              <select 
                value={logFilters.time}
                onChange={(e) => setLogFilters({ ...logFilters, time: e.target.value })}
                className="bg-transparent border-none text-sky-300 font-bold font-mono focus:outline-none text-xs p-0 cursor-pointer ml-1 select-none"
              >
                <option value="Last 15m" className="bg-[#121622]">Last 15m</option>
                <option value="Last 1h" className="bg-[#121622]">Last 1h</option>
                <option value="Last 24h" className="bg-[#121622]">Last 24h</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Split logs display canvas layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-18rem)]">
        
        {/* Terminal logs (Left 8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-xl border border-white/10 bg-[#04060b] overflow-hidden justify-between relative">
          
          {/* Controls toolbar */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded bg-white/5 hover:bg-neutral-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-300 transition-colors backdrop-blur-sm"
              title={isPlaying ? "Pause automatic scroll streaming" : "Resume stream"}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-sky-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-current" />}
            </button>
          </div>

          {/* Actual Log Console lines */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed space-y-2.5 max-h-[460px]">
            {filteredLogs.slice().reverse().map((log) => {
              const isError = log.level === "ERROR" || log.level === "FATAL";
              return (
                <div 
                  key={log.id}
                  className={`py-1.5 px-3 rounded hover:bg-white/[0.02] border-l-2 transition-colors ${
                    isError 
                      ? "bg-rose-500/10 border-rose-500 text-rose-300"
                      : log.level === "WARN"
                      ? "bg-amber-500/5 border-amber-500/40 text-amber-200"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <span className="text-slate-500 text-[10px] w-20 shrink-0 select-none mt-0.5">{log.timestamp}</span>
                    <span className={`text-[10px] font-bold w-12 shrink-0 select-none text-center rounded mt-0.5 ${
                      isError ? "text-rose-400 bg-rose-500/10" : log.level === "WARN" ? "text-amber-400 bg-amber-500/10" : "text-sky-400 bg-sky-500/10"
                    }`}>{log.level}</span>
                    <div className="flex-1 space-y-2 min-w-0">
                      <span className="break-all text-slate-200">{log.message}</span>
                      
                      {/* Nested AI Insight formatting details */}
                      {log.aiInsight && (
                        <div className="mt-1 px-3 py-2 rounded bg-purple-500/5 border border-purple-500/15 text-[11px] text-purple-300 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
                          <div className="space-y-1">
                            <span className="font-bold">AI Diagnostics:</span> {log.aiInsight}
                            {log.stackTrace && (
                              <pre className="text-[10px] text-slate-500 overflow-x-auto leading-normal pt-1 pl-2 border-l border-white/5 font-mono select-none">
                                {log.stackTrace}
                              </pre>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-8 bg-[#090d16] border-t border-white/5 flex items-center justify-between px-4 font-mono text-[10px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-sky-400 animate-pulse" : "bg-slate-600"}`}></span> 
                {isPlaying ? "Streaming" : "Paused"}
              </span>
              <span>Lines: {filteredLogs.length} matching</span>
            </div>
            <div className="flex items-center gap-2">
              <span>UTF-8</span>
              <span>Buffer size: {Math.round(filteredLogs.length * 0.12)} KB</span>
            </div>
          </div>
        </div>

        {/* Sidebar logs indicators (Right 4 cols) */}
        <aside className="lg:col-span-4 space-y-4 flex flex-col justify-between overflow-y-auto">
          
          {/* Chart card */}
          <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              Logging Volume Spikes
            </h3>
            
            <div className="h-24 w-full flex items-end gap-1 select-none mb-2 mt-4">
              <div className="bg-sky-500/10 w-full h-[30%]"></div>
              <div className="bg-sky-500/10 w-full h-[40%]"></div>
              <div className="bg-sky-500/10 w-full h-[35%]"></div>
              <div className="bg-sky-500/15 w-full h-[60%]"></div>
              <div className="bg-sky-500/20 w-full h-[50%]"></div>
              <div className="bg-sky-500/30 w-full h-[80%]"></div>
              <div className="bg-rose-500/40 w-full h-[100%] border-t border-rose-500"></div>
              <div className="bg-sky-500/20 w-full h-[70%]"></div>
              <div className="bg-sky-500/10 w-full h-[45%]"></div>
              <div className="bg-sky-500/10 w-full h-[30%]"></div>
            </div>
            
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>-15 min ago</span>
              <span>Now</span>
            </div>
          </div>

          {/* Top Patterns details list card */}
          <div className="p-4 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Top Signature Patterns
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-rose-300 truncate pr-4">JWT signature mismatch</span>
                    <span className="text-slate-500">412 events</span>
                  </div>
                  <div className="w-full bg-[#1b2031] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[85%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-300 truncate pr-4">Connection pool lock exhaustion</span>
                    <span className="text-slate-500">89 events</span>
                  </div>
                  <div className="w-full bg-[#1b2031] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[45%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-sky-300 truncate pr-4">Latency spikes &gt; 400ms</span>
                    <span className="text-slate-500">34 events</span>
                  </div>
                  <div className="w-full bg-[#1b2031] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full w-[18%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("AI Deep logs scan triggered. Verifying connection thresholds...")}
              className="w-full py-2 border border-purple-500/30 bg-purple-500/5 text-purple-300 text-xs font-mono rounded hover:bg-[#1f1b34] transition-colors mt-6 flex justify-center items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Trigger AI Deep Scan Analytics
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
};
