import React, { createContext, useContext, useState, useEffect } from "react";
import { ViewType, ClusterNode, ClusterStatus, Incident, Severity, LogLine, Vulnerability, PipelineStage, RollbackRecord, ChatMessage, OperationalNotification } from "../types";

interface OperationalContextType {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  clusters: ClusterNode[];
  setClusters: React.Dispatch<React.SetStateAction<ClusterNode[]>>;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  activeLogs: LogLine[];
  logFilters: { grep: string; cluster: string; time: string; service: string };
  setLogFilters: React.Dispatch<React.SetStateAction<{ grep: string; cluster: string; time: string; service: string }>>;
  vulnerabilities: Vulnerability[];
  setVulnerabilities: React.Dispatch<React.SetStateAction<Vulnerability[]>>;
  rollbackHistory: RollbackRecord[];
  pipelineStages: PipelineStage[];
  setPipelineStages: React.Dispatch<React.SetStateAction<PipelineStage[]>>;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
  optimizationSavings: number; // monthly saving applied check
  isOptimizationApplied: boolean;
  applyOptimization: () => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  // Login flow
  userEmail: string;
  setUserEmail: (email: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  userFullName: string;
  setUserFullName: (name: string) => void;
  userCompany: string;
  setUserCompany: (company: string) => void;
  isTriggeringScan: boolean;
  triggerSecScan: () => void;
  complianceScore: number;
  
  // Interactive Live Alerts & Notifications
  notifications: OperationalNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<OperationalNotification[]>>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  triggerAlertSimulation: (severity: "critical" | "warning" | "info", title: string, message: string) => Promise<void>;
}

const OperationalContext = createContext<OperationalContextType | null>(null);

export const useOps = () => {
  const context = useContext(OperationalContext);
  if (!context) throw new Error("useOps must be used inside an OperationalProvider");
  return context;
};

// Raw template sample logs
const LOG_TEMPLATES: Omit<LogLine, "id" | "timestamp">[] = [
  { level: "INFO", service: "auth-api", message: "[auth-api] Connection established to postgres-db-primary (pool: 12/50)" },
  { level: "WARN", service: "payment-gateway", message: "[payment-gateway] Latency spike detected on third-party API (stripe-v3): 450ms" },
  { level: "INFO", service: "user-service", message: "[user-service] GET /api/v1/users/4921 200 OK 12ms" },
  { level: "INFO", service: "user-service", message: "[user-service] GET /api/v1/users/4922 200 OK 14ms" },
  { level: "WARN", service: "auth-api", message: "[auth-api] Token validation latency > 300ms on secondary node" },
  { level: "INFO", service: "checkout-ui", message: "[checkout-ui] Page render completed in 250ms" },
  { level: "INFO", service: "api-gateway", message: "[api-gateway] Access trace registered for route /api/v1/checkout" },
  { level: "INFO", service: "prometheus", message: "[prometheus] Scrape completed for metrics in 45ms" }
];

export const OperationalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setView] = useState<ViewType>(ViewType.OVERVIEW);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // default to logged in SRE to show the cockpit, easily switchable
  const [userEmail, setUserEmail] = useState<string>("sre@nexacorp.com");
  const [userFullName, setUserFullName] = useState<string>("Elena Rostova");
  const [userCompany, setUserCompany] = useState<string>("NexaCorp");

  // Multi-cluster State
  const [clusters, setClusters] = useState<ClusterNode[]>([]);

  // Active Incidents State
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>("INC-2024-089");

  // Active Logs Stream State
  const [activeLogs, setActiveLogs] = useState<LogLine[]>([]);
  const [logFilters, setLogFilters] = useState({
    grep: "",
    cluster: "All",
    time: "Last 15m",
    service: "auth-api"
  });

  // Security Assessment CVE list
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([
    {
      id: "vuln-01",
      cve: "CVE-2023-44487",
      resource: "ingress-nginx",
      namespace: "cluster: prod-eu-west",
      severity: Severity.CRITICAL,
      cvss: 9.8,
      status: "Unpatched",
      cluster: "eu-west-data-2"
    },
    {
      id: "vuln-02",
      cve: "CVE-2024-21626",
      resource: "runc",
      namespace: "namespace: core-services",
      severity: Severity.HIGH,
      cvss: 8.6,
      status: "In Progress",
      cluster: "us-east-prod-1"
    },
    {
      id: "vuln-03",
      cve: "CVE-2023-39325",
      resource: "golang.org/x/net",
      namespace: "image: auth-service:v2.1",
      severity: Severity.MEDIUM,
      cvss: 5.3,
      status: "Open",
      cluster: "us-east-prod-1"
    }
  ]);

  // Rollback logs
  const [rollbackHistory, setRollbackHistory] = useState<RollbackRecord[]>([
    {
      id: "RB-201",
      deployment: "auth-service-v1.2",
      date: "2 hours ago",
      trigger: "Auto-Rollback",
      developer: "SRE Autonomic",
      rootCause: "OOMKilled due to extreme memory leak in redis subscription pools. AI suggested connections timeout."
    },
    {
      id: "RB-202",
      deployment: "payment-api-v3",
      date: "1 day ago",
      trigger: "Manual",
      developer: "Elena Rostova",
      rootCause: "High query reading lag in replica clusters. Missing database Index."
    }
  ]);

  // CI/CD pipelines
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    { id: "st-1", name: "Checkout", status: "done", duration: "12s", icon: "check" },
    { id: "st-2", name: "Build Image", status: "done", duration: "1m 45s", icon: "build" },
    { id: "st-3", name: "E2E Tests", status: "running", duration: "Running...", icon: "science" },
    { id: "st-4", name: "Deploy K8s", status: "pending", duration: "Pending", icon: "cloud_upload" }
  ]);

  // Chat conversation
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Systems online. AIHelm SRE Artificial Intelligence ready.

I'm currently aggregate-monitoring **12 clusters** across 3 edge regions. 
All latency vectors are clear, although we flagged metric spikes on backend service databases. Ask me to:
*   *"Analyze the latest database OOM OOMKilled events."*
*   *"Diagnose the Payment Gateway latency timeouts."*
*   *"Help apply security mitigations for active CVE records."*`,
      timestamp: new Date()
    }
  ]);

  const [isOptimizationApplied, setIsOptimizationApplied] = useState<boolean>(false);
  const [isTriggeringScan, setIsTriggeringScan] = useState<boolean>(false);
  const [complianceScore, setComplianceScore] = useState<number>(85);

  const [notifications, setNotifications] = useState<OperationalNotification[]>([]);

  const fetchJson = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON but received ${contentType || "nothing"}`);
    }
    return res.json();
  };

  const fetchNotifications = async () => {
    try {
      const data = await fetchJson("/api/notifications");
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetchJson("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.success) {
        if (id === "all") {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } else {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const triggerAlertSimulation = async (severity: "critical" | "warning" | "info", title: string, message: string) => {
    try {
      const newNotif = await fetchJson("/api/notifications/trigger-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ severity, title, message })
      });
      if (newNotif && newNotif.id) {
        setNotifications(prev => [newNotif, ...prev]);
        
        // Push a systems alert to chat history dynamically if critical
        if (severity === "critical") {
          addChatMessage({
            id: `system-alert-${Date.now()}`,
            role: "assistant",
            content: `**[SYSTEM CRITICAL TRIGGER ALARM]**
An active high-priority anomaly was register in target federated clusters:
*   **Security alert:** ${title}
*   **Message report:** ${message}
I am analyzing the container telemetry and logs of associated namespace sectors right now. Run a grep search or let me know if we need to schedule automated recovery.`,
            timestamp: new Date()
          });
        }
      }
    } catch (err) {
      console.error("Failed to trigger alert simulation:", err);
    }
  };

  const fetchClusters = async () => {
    try {
      const data = await fetchJson("/api/clusters");
      if (Array.isArray(data)) {
        setClusters(data);
      }
    } catch (err) {
      console.error("Failed fetching clusters:", err);
    }
  };

  const fetchIncidents = async () => {
    try {
      const data = await fetchJson("/api/incidents");
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (err) {
      console.error("Failed fetching incidents:", err);
    }
  };

  const applyOptimization = () => {
    setIsOptimizationApplied(true);
    // Visual feedback, SRE saves monthly budget
    setClusters((prev) =>
      prev.map((c) =>
        c.id === "us-east-prod-1"
          ? { ...c, totalNodes: 130, nodes: 120 }
          : c
      )
    );
  };

  const triggerSecScan = async () => {
    setIsTriggeringScan(true);
    setComplianceScore(81);
    try {
      const data = await fetchJson("/api/security/scan", { method: "POST" });
      setTimeout(() => {
        setIsTriggeringScan(false);
        setComplianceScore(data.score || 98);
        setVulnerabilities((prev) =>
          prev.map((v) => ({ ...v, status: "Patched" }))
        );
      }, 2000);
    } catch (err) {
      console.error("Failed trigger scan:", err);
      setIsTriggeringScan(false);
    }
  };

  // Pull clusters, incidents & notifications on initialization
  useEffect(() => {
    fetchClusters();
    fetchIncidents();
    fetchNotifications();

    const notifInterval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(notifInterval);
  }, []);

  // Sync log streaming fetching from live DB grep engine
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          grep: logFilters.grep,
          service: logFilters.service
        });
        const data = await fetchJson(`/api/logs?${queryParams.toString()}`);
        if (Array.isArray(data)) {
          const mappedLogs: LogLine[] = data.map((item, index) => ({
            id: item.id || `log-${index}-${Date.now()}`,
            timestamp: item.timestamp,
            level: item.level as any,
            service: item.service,
            message: item.message
          }));
          setActiveLogs(mappedLogs);
        }
      } catch (err) {
        console.error("Logs fetching failed:", err);
      }
    };

    fetchLogs();
    const logInterval = setInterval(fetchLogs, 4000);
    return () => clearInterval(logInterval);
  }, [logFilters]);

  const addChatMessage = (msg: ChatMessage) => {
    setChatHistory((prev) => [...prev, msg]);
  };

  const clearChatHistory = () => {
    setChatHistory([
      {
        id: "cleared",
        role: "assistant",
        content: "Terminal diagnostic context cleared. All scopes remain online. How can I assist you now, SRE?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <OperationalContext.Provider
      value={{
        currentView,
        setView,
        clusters,
        setClusters,
        incidents,
        setIncidents,
        activeLogs,
        logFilters,
        setLogFilters,
        vulnerabilities,
        setVulnerabilities,
        rollbackHistory,
        pipelineStages,
        setPipelineStages,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        isOptimizationApplied,
        applyOptimization,
        optimizationSavings: 420,
        selectedIncidentId,
        setSelectedIncidentId,
        userEmail,
        setUserEmail,
        isLoggedIn,
        setIsLoggedIn,
        userFullName,
        setUserFullName,
        userCompany,
        setUserCompany,
        isTriggeringScan,
        triggerSecScan,
        complianceScore,
        notifications,
        setNotifications,
        fetchNotifications,
        markNotificationRead,
        triggerAlertSimulation
      }}
    >
      {children}
    </OperationalContext.Provider>
  );
};
