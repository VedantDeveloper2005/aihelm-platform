export enum ViewType {
  OVERVIEW = "overview",
  CLUSTERS = "clusters",
  INCIDENTS = "incidents",
  AI_ASSISTANT = "ai_assistant",
  MONITORING = "monitoring",
  LOGS = "logs",
  SECURITY = "security",
  CICD = "cicd",
  PROFILE = "profile",
  SETTINGS = "settings",
  DOCS = "docs",
  SUPPORT = "support"
}

export enum ClusterStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded",
  CRITICAL = "critical"
}

export enum Severity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}

export interface ClusterNode {
  id: string;
  name: string;
  provider: "AWS" | "GCP" | "Azure";
  region: string;
  status: ClusterStatus;
  nodes: number;
  totalNodes: number;
  podDensity: number; // percentage
  cpuUsage: number;   // percentage
  memUsage: number;   // percentage
  activePods: number;
}

export interface Incident {
  id: string;
  service: string;
  title: string;
  status: "active" | "acknowledged" | "resolved" ;
  severity: Severity;
  timestamp: string;
  summary: string;
  explanation: string;
  impactedServices: { name: string; status: ClusterStatus }[];
  logs: string[];
  timeline: { time: string; event: string; status: "pending" | "done" }[];
  actionSuggested: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "FATAL";
  service: string;
  message: string;
  aiInsight?: string;
  stackTrace?: string;
}

export interface Vulnerability {
  id: string;
  cve: string;
  resource: string;
  namespace: string;
  severity: Severity;
  cvss: number;
  status: "Open" | "In Progress" | "Patched";
  cluster: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: "done" | "running" | "pending";
  duration?: string;
  icon: string;
}

export interface RollbackRecord {
  id: string;
  deployment: string;
  date: string;
  trigger: "Auto-Rollback" | "Manual";
  rootCause: string;
  developer: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  logs?: string[];
  fixes?: { label: string; action: string }[];
  isThinking?: boolean;
}

export interface OperationalNotification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  read: boolean;
  clusterId?: string;
}

