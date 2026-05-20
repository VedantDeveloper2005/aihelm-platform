import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { ClusterStatus, ClusterNode } from "../types";
import { 
  PlusCircle, 
  Cloud,
  CheckCircle,
  AlertTriangle,
  Server,
  Activity,
  Cpu,
  Database,
  Search,
  Sliders,
  Filter,
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ClustersPanel: React.FC = () => {
  const { clusters, setClusters } = useOps();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Connect cluster form fields
  const [newCluster, setNewCluster] = useState({
    name: "",
    provider: "AWS" as "AWS" | "GCP" | "Azure",
    region: "",
    nodes: 10,
    totalNodes: 50,
  });

  const getStatusBadge = (status: ClusterStatus) => {
    switch (status) {
      case ClusterStatus.HEALTHY:
        return (
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Healthy
          </span>
        );
      case ClusterStatus.DEGRADED:
        return (
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Degraded
          </span>
        );
      case ClusterStatus.CRITICAL:
        return (
          <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Critical
          </span>
        );
    }
  };

  const calculateTotals = () => {
    const totalCpu = clusters.reduce((acc, c) => acc + c.cpuUsage, 0) / clusters.length;
    const totalMem = clusters.reduce((acc, c) => acc + c.memUsage, 0) / clusters.length;
    const totalActivePods = clusters.reduce((acc, c) => acc + c.activePods, 0);
    return { avgCpu: Math.round(totalCpu), avgMem: Math.round(totalMem), totalActivePods };
  };

  const totals = calculateTotals();

  // AWS height relative 80%, GCP 60%, Azure 30%
  const providerDistribution = {
    AWS: clusters.filter(c => c.provider === "AWS").length,
    GCP: clusters.filter(c => c.provider === "GCP").length,
    Azure: clusters.filter(c => c.provider === "Azure").length,
  };

  const [onboardedScript, setOnboardedScript] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleConnectCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCluster.name || !newCluster.region || isConnecting) return;

    setIsConnecting(true);
    try {
      const response = await fetch("/api/onboard-cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCluster.name,
          provider: newCluster.provider,
          region: newCluster.region,
          nodes: Number(newCluster.nodes),
          totalNodes: Number(newCluster.totalNodes),
        })
      });

      const nodeItem = await response.json();
      if (nodeItem && nodeItem.id) {
        setClusters((prev) => [...prev, nodeItem]);
        setOnboardedScript(nodeItem.helmCommand);
      }
    } catch (err) {
      console.error("Clusters onboarding failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCloseModal = () => {
    setShowConnectModal(false);
    setOnboardedScript(null);
    setNewCluster({ name: "", provider: "AWS", region: "", nodes: 10, totalNodes: 50 });
  };

  const filteredClusters = clusters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview stats header button controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Federated Clusters</h2>
          <p className="text-slate-400 text-sm mt-1">
            Aggregate monitoring of {clusters.length} active target contexts.
          </p>
        </div>
        <button 
          onClick={() => setShowConnectModal(true)}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(124,58,237,0.39)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <PlusCircle className="w-4 h-4" />
          Connect New Cluster
        </button>
      </div>

      {/* Cloud Providers Distribution & Global Health Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Distribution diagram graphs */}
        <div className="md:col-span-8 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-400" />
              Cloud Providers Distribution
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">Live Telemetry</span>
          </div>

          <div className="h-44 flex items-end gap-6 border-b border-white/5 pb-2 relative z-10 select-none">
            {/* AWS (4) */}
            <div className="w-1/3 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 rounded-t-sm h-[80%] transition-all relative">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1f2e] border border-sky-500/40 px-2 py-1 text-[10px] font-mono rounded text-sky-300">
                  AWS Nodes: {clusters.filter(c => c.provider === "AWS").reduce((s, c) => s + c.nodes, 0)}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">AWS ({providerDistribution.AWS})</span>
            </div>

            {/* GCP (3) */}
            <div className="w-1/3 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-t-sm h-[60%] transition-all relative">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1f2e] border border-purple-500/40 px-2 py-1 text-[10px] font-mono rounded text-purple-300">
                  GCP Nodes: {clusters.filter(c => c.provider === "GCP").reduce((s, c) => s + c.nodes, 0)}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">GCP ({providerDistribution.GCP})</span>
            </div>

            {/* Azure */}
            <div className="w-1/3 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-t-sm h-[30%] transition-all relative">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1f2e] border border-indigo-500/40 px-2 py-1 text-[10px] font-mono rounded text-indigo-300">
                  Azure Nodes: {clusters.filter(c => c.provider === "Azure").reduce((s, c) => s + c.nodes, 0)}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">Azure ({providerDistribution.Azure})</span>
            </div>

            {/* Simulated overlay line graph */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M 16 35 M 16 20 L 50 40 L 83 70" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4"></path>
              <circle cx="83" cy="70" r="3" fill="#6366f1" className="animate-ping"></circle>
            </svg>
          </div>
        </div>

        {/* Global summary card info controls */}
        <div className="md:col-span-4 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[50px] rounded-full"></div>
          <div>
            <h3 className="text-base font-bold text-white mb-2">Global health scorecard</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold font-mono text-sky-400">99.8%</span>
              <span className="text-xs text-slate-400 font-mono">avg SLA status (30d)</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Healthy Nodes
              </span>
              <span className="text-white font-bold">{clusters.filter(c => c.status === ClusterStatus.HEALTHY).length}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 text-amber-400 animate-pulse"></span> Degraded Contexts
              </span>
              <span className="text-white font-bold">{clusters.filter(c => c.status === ClusterStatus.DEGRADED).length}</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Critical Threat
              </span>
              <span className="text-white font-bold">{clusters.filter(c => c.status === ClusterStatus.CRITICAL).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster search tool filters */}
      <div className="flex justify-between items-end border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-400" />
          Active Cloud Deployments
        </h3>
        
        <div className="flex items-center gap-2 bg-[#121622] border border-white/10 rounded-lg px-3 py-1 text-xs">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search regions/providers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-0 text-xs w-44 py-1"
          />
        </div>
      </div>

      {/* Deploy list matching target context search query */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClusters.map((cluster) => (
          <div 
            key={cluster.id}
            className={`p-5 rounded-xl border transition-all duration-300 relative group overflow-hidden bg-[#121622]/60 ${
              cluster.status === ClusterStatus.CRITICAL 
                ? "border-rose-500/20 hover:border-rose-500/40 hover:shadow-[0_4px_24px_rgba(239,68,68,0.1)]" 
                : "border-white/10 hover:border-sky-500/20 hover:shadow-[0_4px_24px_rgba(56,189,248,0.05)]"
            }`}
          >
            {/* Header: provider name status status */}
            <div className="flex justify-between items-baseline mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-white/5 border border-white/15 rounded flex items-center justify-center font-bold text-xs text-sky-400 font-mono">
                  {cluster.provider[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">{cluster.name}</h4>
                  <p className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{cluster.provider} • {cluster.region}</p>
                </div>
              </div>
              {getStatusBadge(cluster.status)}
            </div>

            {/* Density & capacity nodes count indicators */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">Nodes capacity</span>
                <span className="text-sm font-semibold font-mono text-white">
                  {cluster.nodes} <span className="text-slate-400 font-normal">/ {cluster.totalNodes}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">Pod Density</span>
                <span className="text-sm font-semibold font-mono text-white">
                  {cluster.podDensity}%
                </span>
              </div>
            </div>

            <div className="w-full bg-[#1b2031] h-1 rounded-full mt-4 overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  cluster.status === ClusterStatus.CRITICAL ? "bg-rose-400" : "bg-sky-400"
                }`}
                style={{ width: `${cluster.podDensity}%` }}
              ></div>
            </div>

            {cluster.status === ClusterStatus.DEGRADED && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-accent text-purple-300">
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                AI Rebalancing workload replication threads...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal - Connect New Cloud Cluster Setup */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#131725] border border-white/10 rounded-xl overflow-hidden shadow-2xl p-6 relative"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <PlusCircle className="text-purple-400 w-5 h-5" />
                Connect federated Cluster
              </h2>
              <p className="text-xs text-slate-400 mb-6">Link multi-region Kubernetes resources directly into AIHelm control planes.</p>

              {onboardedScript ? (
                <div className="space-y-4">
                  <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-bold block">Secure Agent Installation CLI script</span>
                  <div className="p-4 rounded-lg bg-[#0e111a] border border-emerald-500/20 text-emerald-400 font-mono text-xs select-all break-all whitespace-pre-wrap leading-relaxed shadow-inner relative">
                    <div className="absolute top-2 right-2 text-[9px] uppercase font-bold text-emerald-500/40 bg-emerald-500/5 px-1.5 py-0.5 rounded tracking-wider">Helm Chart CLI</div>
                    {onboardedScript}
                  </div>
                  <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/15 text-[11px] text-emerald-400 leading-normal flex items-start gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Cluster registered. Execute the Helm instruction above directly inside your Kubernetes target sector environment. The Agent will securely open a bidirectional websocket push tunnel to AIHelm control planes.
                    </span>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold rounded-lg mt-2 transition-all cursor-pointer shadow"
                  >
                    Complete Connection Protocol
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConnectCluster} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 uppercase font-mono">Cluster Suffix Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="us-west-prod-2"
                      value={newCluster.name}
                      onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                      className="w-full bg-[#1b2031] border border-white/10 focus:border-purple-500 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase font-mono">Cloud Provider</label>
                      <select 
                        value={newCluster.provider}
                        onChange={(e) => setNewCluster({ ...newCluster, provider: e.target.value as any })}
                        className="w-full bg-[#1b2031] border border-white/10 focus:border-purple-500 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none font-mono"
                      >
                        <option value="AWS">AWS</option>
                        <option value="GCP">GCP</option>
                        <option value="Azure">Azure</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase font-mono">Region</label>
                      <input 
                        type="text" 
                        required
                        placeholder="us-west-2"
                        value={newCluster.region}
                        onChange={(e) => setNewCluster({ ...newCluster, region: e.target.value })}
                        className="w-full bg-[#1b2031] border border-white/10 focus:border-purple-500 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase font-mono">Active Nodes</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={newCluster.nodes}
                        onChange={(e) => setNewCluster({ ...newCluster, nodes: Number(e.target.value) })}
                        className="w-full bg-[#1b2031] border border-white/10 focus:border-purple-500 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 uppercase font-mono">Total capacity</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={newCluster.totalNodes}
                        onChange={(e) => setNewCluster({ ...newCluster, totalNodes: Number(e.target.value) })}
                        className="w-full bg-[#1b2031] border border-white/10 focus:border-purple-500 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-sm font-semibold rounded-lg mt-4 shadow-lg transition-all disabled:opacity-50"
                  >
                    {isConnecting ? "Initiating Connection Protocol..." : "Initiate Connection Protocol"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
