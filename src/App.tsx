import React from "react";
import { ViewType } from "./types";
import { useOps, OperationalProvider } from "./context/OperationalContext";
import { AuthScreens } from "./components/AuthScreens";
import { OverviewPanel } from "./components/OverviewPanel";
import { ClustersPanel } from "./components/ClustersPanel";
import { IncidentsPanel } from "./components/IncidentsPanel";
import { AssistantPanel } from "./components/AssistantPanel";
import { MonitoringPanel } from "./components/MonitoringPanel";
import { LogsPanel } from "./components/LogsPanel";
import { SecurityPanel } from "./components/SecurityPanel";
import { CicdPanel } from "./components/CicdPanel";
import { ProfilePanel } from "./components/ProfilePanel";
import { 
  Compass, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Terminal, 
  Lock, 
  GitBranch, 
  LogOut, 
  Server, 
  Bell, 
  HelpCircle,
  Menu,
  ChevronRight,
  UserCheck
} from "lucide-react";

const MainAppContent: React.FC = () => {
  const { 
    currentView, 
    setView, 
    isLoggedIn, 
    setIsLoggedIn, 
    userFullName, 
    userEmail, 
    userCompany,
    notifications,
    markNotificationRead,
    triggerAlertSimulation
  } = useOps();

  const [showNotificationsMenu, setShowNotificationsMenu] = React.useState(false);

  if (!isLoggedIn) {
    return <AuthScreens />;
  }

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  // Sidebar Layout configuration matching Views
  const NAV_ITEMS = [
    { type: ViewType.OVERVIEW, label: "Overview", icon: Layers, count: null },
    { type: ViewType.CLUSTERS, label: "Clusters", icon: Server, count: null },
    { type: ViewType.INCIDENTS, label: "Incidents", icon: AlertTriangle, count: 1 },
    { type: ViewType.AI_ASSISTANT, label: "AI Assistant", icon: Sparkles, count: "AI" },
    { type: ViewType.MONITORING, label: "Monitoring", icon: Activity, count: null },
    { type: ViewType.LOGS, label: "Logs", icon: Terminal, count: "live" },
    { type: ViewType.SECURITY, label: "Security", icon: Lock, count: null },
    { type: ViewType.CICD, label: "CI/CD Pipeline", icon: GitBranch, count: null },
  ];

  const renderActiveView = () => {
    switch (currentView) {
      case ViewType.OVERVIEW:
        return <OverviewPanel />;
      case ViewType.CLUSTERS:
        return <ClustersPanel />;
      case ViewType.INCIDENTS:
        return <IncidentsPanel />;
      case ViewType.AI_ASSISTANT:
        return <AssistantPanel />;
      case ViewType.MONITORING:
        return <MonitoringPanel />;
      case ViewType.LOGS:
        return <LogsPanel />;
      case ViewType.SECURITY:
        return <SecurityPanel />;
      case ViewType.CICD:
        return <CicdPanel />;
      case ViewType.PROFILE:
        return <ProfilePanel />;
      default:
        return <OverviewPanel />;
    }
  };

  const getViewportTitle = () => {
    switch (currentView) {
      case ViewType.OVERVIEW: return "System Operations Overview";
      case ViewType.CLUSTERS: return "Multi-Cluster Federation Control";
      case ViewType.INCIDENTS: return "Active Workload Incidents & Playbooks";
      case ViewType.AI_ASSISTANT: return "AIHelm Cognitive Troubleshooting Assistant";
      case ViewType.MONITORING: return "Performance & SLA Telemetry Graphs";
      case ViewType.LOGS: return "Central Static Log Analytics GPG Router";
      case ViewType.SECURITY: return "DevSecOps Vulnerability Auditing";
      case ViewType.CICD: return "Pipeline Release Delivery Control";
      case ViewType.PROFILE: return "SRE Operator Identity Profile";
      default: return "AIHelm Control Plane";
    }
  };

  return (
    <div className="min-h-screen bg-[#060810] text-[#ebeefc] flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#090b14] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Main App branding logo header */}
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white border border-purple-500/20 shadow-[0_2px_10px_rgba(139,92,246,0.3)]">
              <Compass className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white font-sans flex items-center gap-1.5">
                AIHelm
                <span className="px-1.5 py-0.5 text-[8.5px] uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded font-bold font-mono">v1.2</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">SRE Cockpit Engine</p>
            </div>
          </div>

          {/* SRE Profile card info */}
          <button 
            type="button"
            onClick={() => setView(ViewType.PROFILE)}
            className={`w-[calc(100%-24px)] mx-3 my-4 p-4 rounded-xl border flex gap-2.5 items-center relative group cursor-pointer text-left transition-all ${
              currentView === ViewType.PROFILE 
                ? "bg-purple-950/20 border-purple-500/30" 
                : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-sky-600 border border-sky-400/20 flex items-center justify-center text-[#ebeefc] text-xs font-bold leading-none shrink-0 uppercase">
              {userFullName.slice(0,2)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-purple-300 transition-colors">{userFullName}</h4>
              <p className="text-[9.5px] text-slate-500 font-mono truncate mt-0.5">{userCompany} • active</p>
            </div>
            <div className="absolute right-3.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
          </button>

          {/* Navigation Links list */}
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setView(item.type)}
                  className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all duration-150 transform hover:translate-x-0.5 cursor-pointer ${
                    isActive 
                      ? "bg-gradient-to-r from-purple-950/30 to-slate-900 border-l-2 border-purple-500 text-purple-200 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.02] border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-purple-400" : "text-slate-500 group-hover:text-slate-200"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono tracking-wide ${
                      item.count === "AI" 
                        ? "text-purple-300 bg-purple-500/15 font-bold uppercase" 
                        : item.count === "live"
                        ? "text-emerald-400 bg-emerald-500/10 animate-pulse font-bold"
                        : "text-rose-300 bg-rose-500/15"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer controls Log-Out */}
        <div className="p-4 border-t border-white/5 space-y-3.5">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pl-1">
            <span>SLA: 99.98%</span>
            <span>UTC Clock OK</span>
          </div>

          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full py-2 px-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 font-mono text-[11px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out Workspace
          </button>
        </div>
      </aside>

      {/* Main Viewport Content canvas */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Control Bar Status details */}
        <header className="h-16 border-b border-white/5 bg-[#090b14]/50 flex justify-between items-center px-6 relative z-20">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-white tracking-tight">{getViewportTitle()}</h2>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[10.5px] text-slate-500 font-mono tracking-wide uppercase">Active Control Node: root-1</span>
          </div>

          {/* Info notifications details */}
          <div className="flex items-center gap-3.5 relative">
            <button 
              type="button"
              onClick={() => setView(ViewType.PROFILE)}
              className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
              title="Click to view operator access profile"
            >
              <UserCheck className="w-3 h-3 text-emerald-400" /> Authorized
            </button>

            <button 
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className={`p-2 rounded hover:bg-white/5 transition-colors relative cursor-pointer ${showNotificationsMenu ? "text-white bg-white/5" : "text-slate-400 hover:text-white"}`} 
              title={`${unreadCount} unread system alerts.`}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[9px] font-bold px-1 rounded-full min-w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {showNotificationsMenu && (
              <div className="absolute right-0 top-10 w-80 rounded-xl border border-white/10 bg-[#0d0f1b] shadow-2xl p-4 space-y-3.5 z-50 text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] font-mono">Federated Alerts ({unreadCount})</span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markNotificationRead("all")}
                      className="text-purple-300 hover:text-purple-400 font-semibold font-mono text-[9.5px] cursor-pointer"
                    >
                      Dismiss All
                    </button>
                  )}
                </div>

                {/* Scrollable notifications list */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {(!notifications || notifications.length === 0) ? (
                    <p className="text-slate-500 text-center py-4 font-mono text-[10px]">No unread alerts in index queue.</p>
                  ) : (
                    notifications.map((notif) => {
                      const isCritical = notif.severity === "critical";
                      const isWarning = notif.severity === "warning";
                      return (
                        <div 
                          key={notif.id} 
                          className={`p-2.5 rounded-lg border text-[11px] relative transition-all ${
                            notif.read 
                              ? "bg-white/[0.01] border-white/5 opacity-60" 
                              : isCritical 
                              ? "bg-rose-950/20 border-rose-500/20 text-rose-200" 
                              : isWarning 
                              ? "bg-amber-950/20 border-amber-500/20 text-amber-200"
                              : "bg-blue-950/20 border-blue-500/20 text-blue-200"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className={`font-bold font-mono text-[9.5px] uppercase ${
                              isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-sky-400"
                            }`}>
                              [{notif.severity}] {notif.title}
                            </span>
                            {!notif.read && (
                              <button 
                                onClick={() => markNotificationRead(notif.id)} 
                                className="text-[9px] text-slate-400 hover:text-white underline cursor-pointer shrink-0 ml-1 font-mono"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-300 mt-1 leading-snug">{notif.message}</p>
                          <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">{notif.timestamp}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Alert simulator form builder inside of notifications dropdown! */}
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] font-mono block">Simulate Threat Incident</span>
                  
                  <div className="space-y-1.5">
                    <input 
                      id="sim-title"
                      placeholder="Title: e.g. Mongo Connection Dropped" 
                      className="w-full bg-[#131522] border border-white/5 rounded px-2 py-1 text-white font-mono text-[10px] focus:outline-none focus:border-purple-500"
                    />
                    <input 
                      id="sim-desc"
                      placeholder="Message: e.g. Replset latency threshold..." 
                      className="w-full bg-[#131522] border border-white/5 rounded px-2 py-1 text-white font-mono text-[10px] focus:outline-none focus:border-purple-500"
                    />
                    
                    <div className="flex items-center gap-1.5">
                      <select 
                        id="sim-severity"
                        className="bg-[#131522] border border-white/5 rounded px-1.5 py-1 text-[10px] text-slate-300 font-mono focus:outline-none"
                      >
                        <option value="critical">Critical Alarm</option>
                        <option value="warning">Warning alert</option>
                        <option value="info">Info note</option>
                      </select>

                      <button
                        onClick={async () => {
                          const titleEl = document.getElementById("sim-title") as HTMLInputElement;
                          const descEl = document.getElementById("sim-desc") as HTMLInputElement;
                          const sevEl = document.getElementById("sim-severity") as HTMLSelectElement;
                          
                          if (titleEl && descEl && sevEl) {
                            const title = titleEl.value.trim() || "Simulation Alert";
                            const desc = descEl.value.trim() || "Synthetic system trigger incident reported.";
                            const sev = sevEl.value as any;
                            
                            await triggerAlertSimulation(sev, title, desc);
                            
                            // Reset inputs beautifully
                            titleEl.value = "";
                            descEl.value = "";
                          }
                        }}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 font-semibold font-mono text-[9px] text-white px-2 py-1 rounded cursor-pointer transition-colors text-center"
                      >
                        Fire Alert
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Outer view panels content inside padded margins */}
        <div className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </div>

      </main>

    </div>
  );
};

export default function App() {
  return (
    <OperationalProvider>
      <MainAppContent />
    </OperationalProvider>
  );
}
