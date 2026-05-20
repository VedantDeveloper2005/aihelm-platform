import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Request tracking for diagnostics in development
const requestHistoryLogs: Array<{ timestamp: string; method: string; url: string; headers: any }> = [];

app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    requestHistoryLogs.push({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        accept: req.headers.accept,
        "user-agent": req.headers["user-agent"]
      }
    });
  }
  next();
});

app.get("/api/debug-requests", (req, res) => {
  res.json({
    status: "ok",
    nodeEnv: process.env.NODE_ENV,
    history: requestHistoryLogs.slice(-40)
  });
});

const PORT = 3000;

// Lazy initialized Gemini Client
let gClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!gClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      gClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return gClient;
}

// ------------------------------------------------------------------
// IN-MEMORY ACTIVE OPERATIONAL DATABASE (Simulating Multi-Tenant State)
// ------------------------------------------------------------------

interface ClusterNode {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: string;
  nodes: number;
  totalNodes: number;
  podDensity: number;
  cpuUsage: number;
  memUsage: number;
  activePods: number;
  agentToken?: string;
  helmCommand?: string;
}

const clustersDb: ClusterNode[] = [
  {
    id: "us-east-prod-1",
    name: "us-east-prod-1",
    provider: "AWS",
    region: "us-east-1",
    status: "HEALTHY",
    nodes: 124,
    totalNodes: 150,
    podDensity: 82,
    cpuUsage: 68,
    memUsage: 76,
    activePods: 341
  },
  {
    id: "eu-west-data-2",
    name: "eu-west-data-2",
    provider: "GCP",
    region: "europe-west3",
    status: "DEGRADED",
    nodes: 64,
    totalNodes: 104,
    podDensity: 94,
    cpuUsage: 89,
    memUsage: 94,
    activePods: 512
  },
  {
    id: "ap-east-edge-1",
    name: "ap-east-edge-1",
    provider: "Azure",
    region: "ap-east",
    status: "CRITICAL",
    nodes: 12,
    totalNodes: 48,
    podDensity: 100,
    cpuUsage: 98,
    memUsage: 96,
    activePods: 395
  }
];

interface Incident {
  id: string;
  service: string;
  title: string;
  status: string;
  severity: string;
  timestamp: string;
  summary: string;
  explanation: string;
  actionSuggested: string;
  impactedServices: Array<{ name: string; status: string }>;
  logs: string[];
  timeline: Array<{ time: string; event: string; status: string }>;
}

const incidentsDb: Incident[] = [
  {
    id: "INC-2024-089",
    service: "payment-processor",
    title: "Payment Gateway Timeout",
    status: "active",
    severity: "CRITICAL",
    timestamp: "12m ago",
    summary: "Anomalous latency spikes starting at 10:04 UTC in payment clusters.",
    explanation: "Connection pool exhaustion triggered by inefficient SQL timeout scenarios running in the primary payment-processor container module.",
    actionSuggested: "Rollback deployment to v2.4.0-stable code to safely handle Redis connection pool thresholds.",
    impactedServices: [
      { name: "payment-processor", status: "CRITICAL" },
      { name: "checkout-ui", status: "DEGRADED" },
      { name: "auth-service", status: "HEALTHY" }
    ],
    logs: [
      "10:03:45 UTC [INFO] Connection pool healthy. Active: 12, Idle: 8",
      "10:04:12 UTC [WARN] High latency detected on /api/v1/charge (2400ms)",
      "10:04:15 UTC [ERROR] DB_CONN_TIMEOUT: Failed to acquire connection from pool after 5000ms",
      "10:04:16 UTC [ERROR] Cascading failure: 45 concurrent requests waiting on pool",
      "10:04:20 UTC [WARN] Circuit breaker tripped for payment-gateway downstream",
      "10:05:00 UTC [FATAL] Readiness probe failed. Pod restarting.",
      "10:05:30 UTC [INFO] Initializing new pod payment-processor-svc-7f8d..."
    ],
    timeline: [
      { time: "10:05 UTC", event: "Error anomalies registered by Prometheus metrics.", status: "done" },
      { time: "10:06 UTC", event: "AIHelm Root Cause algorithm mapping stack trace logs.", status: "done" },
      { time: "10:07 UTC", event: "Auto-Healing rollback triggered.", status: "pending" }
    ]
  },
  {
    id: "INC-2024-002",
    service: "auth-api",
    title: "Vulnerability Threat Triggered",
    status: "acknowledged",
    severity: "HIGH",
    timestamp: "45m ago",
    summary: "High volume of unauthorized JWT validation signatures detected.",
    explanation: "Ingress-nginx Rapid Reset floods triggers resource spikes on authentication endpoints.",
    actionSuggested: "Upgrade nginx controller ingress config to version 1.9.4.",
    impactedServices: [
      { name: "auth-api", status: "DEGRADED" }
    ],
    logs: [
      "09:15:10 UTC [WARN] Rate limiting triggered for host source IP range.",
      "09:16:02 UTC [WARN] Authentication verification queue backlog > 450",
      "09:17:01 UTC [INFO] Traffic re-routed to backup auth replication proxy."
    ],
    timeline: [
      { time: "09:15 UTC", event: "Incident triggered by threat scanner.", status: "done" },
      { time: "09:17 UTC", event: "Backup route configured dynamically", status: "done" }
    ]
  }
];

interface Vulnerability {
  id: string;
  cve: string;
  resource: string;
  namespace: string;
  severity: string;
  cvss: number;
  status: string;
  cluster: string;
}

const vulnerabilitiesDb: Vulnerability[] = [
  {
    id: "vuln-01",
    cve: "CVE-2023-44487",
    resource: "ingress-nginx",
    namespace: "cluster: prod-eu-west",
    severity: "CRITICAL",
    cvss: 9.8,
    status: "Unpatched",
    cluster: "eu-west-data-2"
  },
  {
    id: "vuln-02",
    cve: "CVE-2024-21626",
    resource: "runc",
    namespace: "namespace: core-services",
    severity: "HIGH",
    cvss: 8.6,
    status: "In Progress",
    cluster: "us-east-prod-1"
  },
  {
    id: "vuln-03",
    cve: "CVE-2023-39325",
    resource: "golang.org/x/net",
    namespace: "image: auth-service:v2.1",
    severity: "MEDIUM",
    cvss: 5.3,
    status: "Open",
    cluster: "us-east-prod-1"
  }
];

const LOG_TEMPLATES = [
  { level: "INFO", service: "auth-api", message: "[auth-api] Connection established to postgres-db-primary (pool: 12/50)" },
  { level: "WARN", service: "payment-gateway", message: "[payment-gateway] Latency spike detected on third-party API (stripe-v3): 450ms" },
  { level: "INFO", service: "user-service", message: "[user-service] GET /api/v1/users/4921 200 OK 12ms" },
  { level: "INFO", service: "user-service", message: "[user-service] GET /api/v1/users/4922 200 OK 14ms" },
  { level: "WARN", service: "auth-api", message: "[auth-api] Token validation latency > 300ms on secondary node" },
  { level: "INFO", service: "checkout-ui", message: "[checkout-ui] Page render completed in 250ms" },
  { level: "INFO", service: "api-gateway", message: "[api-gateway] Access trace registered for route /api/v1/checkout" },
  { level: "INFO", service: "prometheus", message: "[prometheus] Scrape completed for metrics in 45ms" }
];

// Generates dynamic logs in physical timeline back buffer
const staticLogPool: Array<{ id: string; timestamp: string; level: string; service: string; message: string }> = [];
function seedLogPool() {
  const baseTime = Date.now() - 3600000; // 1 hour ago
  for (let i = 0; i < 500; i++) {
    const tmpl = LOG_TEMPLATES[i % LOG_TEMPLATES.length];
    const timestampStr = new Date(baseTime + i * 7200).toLocaleTimeString("en-US", { hour12: false });
    staticLogPool.push({
      id: `back-log-${i}`,
      timestamp: timestampStr,
      level: tmpl.level,
      service: tmpl.service,
      message: tmpl.message
    });
  }
}
seedLogPool();

// SRE Knowledge-base for high-fidelity fallback responses
const FALLBACK_ANSWERS = [
  {
    keywords: ["oom", "out of memory", "oomkilled", "crashing", "crash"],
    response: `**AIHelm Diagnostics & Anomaly Report:**
The primary cause of the frontend/auth pods crashing is a series of **OOMKilled** events. 

*   **Identified Root Cause:** A memory leak was introduced in the connection pool module during the release of deployment \`v4.2.1-rc\`. Connections are allocated but not released correctly during API timeouts.
*   **System Impact:** Memory consumption on the affected pods rose exponentially from 40% to 98% over a 12-minute window, triggering the Node Out-Of-Memory (OOM) Killer to safeguard host stability.
*   **Immediate Actionable Fixes:**
    1.  **Execute Rolback:** Click **"Execute Rollback"** in the Active Incidents tab to downgrade the cluster target deployment safely to \`v4.2.0-stable\`.
    2.  **Increase Memory Limits:** Apply patch configurations adjusting resources limits from \`memory: 512Mi\` to \`memory: 1Gi\` temporarily.
    3.  **Connection Timeouts:** Implement active idle connection pruning thresholds.`
  },
  {
    keywords: ["latency", "slow", "delay", "seconds", "ms", "stripe", "timeout"],
    response: `**AIHelm Performance & Latency Report:**
We have registered cascading latency spikes (up to 4.2 seconds) propagating through the \`payment-processor-svc\` downstream.

*   **Diagnosis:** The issue is traced to connection queue saturation at the database layer. External network timeouts on third-party gateways (e.g. Stripe checkout) are failing to release DB connections, exhausting the active pool and causing queries to block.
*   **System Posture:** Active database client connections peaked at 100/100, which triggered DB query read lag across all replicas.
*   **Suggested Runbook Solution:**
    1.  **Run Auto-Heal:** Click **"Acknowledge"** and run the **"Execute Rollback"** play.
    2.  **Circuit Breaker:** Verify that downstream circuit breakers are set to trip at a 1500ms failure threshold.
    3.  **Active Scale Up:** Scale replica set \`frontend-app\` to 5 instances to handle HTTP queue retries.`
  },
  {
    keywords: ["security", "vuln", "cve", "compliance", "scan", "benchmarks"],
    response: `**AIHelm Security & Compliance Policy Posture:**
The overall DevSecOps Posture for your active clusters is currently evaluated at **85% Compliance**.

*   **Active Threats:** We detected **3 Critical Vulnerabilities (CVE)**. The primary risk is \`CVE-2023-44487\` (HTTP/2 Rapid Reset DDoS vulnerability) located inside the \`ingress-nginx\` resource in \`prod-eu-west\`.
*   **Vulnerability Remediation Plan:**
    1.  **Auto-Fix Patch:** Click the **Auto-Fix (wand icon)** directly next to the CVE listing in the Security panel.
    2.  **Ingress Upgrade:** Upgrade your NGINX ingress resources immediately to Version \`1.9.4\` or later.
    3.  **Network Policies:** Apply active rate-limiting firewall filters to reduce flood vector exposure.`
  },
  {
    keywords: ["optimization", "save", "cost", "underutilized", "resource"],
    response: `**AIHelm Cost & Resource Optimization Assessment:**
Our intelligence model evaluated active worker node utilization across \`cluster-us-east-1\` and discovered substantial efficiency gains.

*   **Summary:** Underutilized node count stands at 6 instances, representing redundant CPU allocations.
*   **Optimization Analysis:** Scaling our cluster down dynamically will reclaim idle processors, cutting monthly infrastructure cloud costs by **$420/month** without degrading application SLAs.
*   **Action Plan:** Click **"Apply Optimization"** in the Overview Panel. This will safely drain the underutilized worker nodes and migrate worksets to active target nodes.`
  }
];

// Helper to provide SRE conversational answers
function getFallbackSREAnswer(prompt: string): string {
  const p = prompt.toLowerCase();
  for (const item of FALLBACK_ANSWERS) {
    if (item.keywords.some((kw) => p.includes(kw))) {
      return item.response;
    }
  }
  return `**AIHelm SRE Assistant Answer:**
  I've completed an active trace search of your federated cluster telemetry.
  
  All main service metrics (CPU/Memory) are now stable. There are no active log error anomalies registering in the last 15 minutes.
  *   **Active Scope:** \`us-east-1-prod\`
  *   **Pods:** 341/341 Operational
  *   **Health:** Optimal
  
  How can I assist you with cluster topologies, logs grep, CI/CD pipeline promotions, secure vulnerabilties patching, or incident rollbacks today?`;
}

// ------------------------------------------------------------------
// BACKGROUND TELEMETRY & LIVE CHAOS SIMULATION
// ------------------------------------------------------------------

// 1. Regular metric fluctuations and live logs appending (Runs every 2.5 seconds)
setInterval(() => {
  try {
    // Fluctuate cpuUsage, memUsage, activePods for every cluster slightly
    clustersDb.forEach(c => {
      const isCritical = c.status === "CRITICAL";
      const isDegraded = c.status === "DEGRADED";
      
      let changeCpu = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
      let changeMem = Math.floor(Math.random() * 3) - 1;
      
      // If critical, keep it high; if healthy, keep it normal
      if (isCritical) {
        c.cpuUsage = Math.max(92, Math.min(99, c.cpuUsage + changeCpu));
        c.memUsage = Math.max(90, Math.min(99, c.memUsage + changeMem));
      } else if (isDegraded) {
        c.cpuUsage = Math.max(78, Math.min(91, c.cpuUsage + changeCpu));
        c.memUsage = Math.max(80, Math.min(91, c.memUsage + changeMem));
      } else {
        c.cpuUsage = Math.max(45, Math.min(75, c.cpuUsage + changeCpu));
        c.memUsage = Math.max(50, Math.min(78, c.memUsage + changeMem));
      }

      // Slightly fluctuate node count or pod count
      const changePods = Math.floor(Math.random() * 5) - 2; // -2 to +2
      c.activePods = Math.max(20, c.activePods + changePods);
    });

    // Generate a fresh live telemetry log line
    const baseTemplates = [
      { level: "INFO", service: "auth-api", message: `[auth-api] Token authorization token parsed successfully in ${Math.floor(Math.random() * 10) + 2}ms` },
      { level: "INFO", service: "payment-gateway", message: `[payment-gateway] GET /api/v3/transactions/txn_${Math.floor(Math.random() * 100000)} status: 200` },
      { level: "INFO", service: "user-service", message: `[user-service] DB session pool ping verified. Active instances: ${Math.floor(Math.random()*20)+10}/50` },
      { level: "INFO", service: "checkout-ui", message: `[checkout-ui] Keep-alive socket ping acknowledged` },
      { level: "INFO", service: "api-gateway", message: `[api-gateway] Access trace: POST /api/v1/sessions active socket handshake` },
      { level: "INFO", service: "prometheus", message: "[prometheus] Scraped metrics for namespace: kube-system successfully" }
    ];

    const tmpl = baseTemplates[Math.floor(Math.random() * baseTemplates.length)];
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    
    staticLogPool.push({
      id: `live-log-${Date.now()}`,
      timestamp: timeStr,
      level: tmpl.level,
      service: tmpl.service,
      message: tmpl.message
    });

    if (staticLogPool.length > 800) {
      staticLogPool.shift();
    }
  } catch (err) {
    console.error("Error in server telemetry simulation ticker loop:", err);
  }
}, 2500);

// 2. SRE Chaos engineering disaster generator (runs every 40 seconds)
// Keeps the SRE cockpit fully interactive by dynamically injecting a new issue if all clusters are fully healthy!
setInterval(() => {
  try {
    const allHealthy = clustersDb.every(c => c.status === "HEALTHY");
    if (allHealthy) {
      // Pick a random cluster to inject chaos
      const targets = ["eu-west-data-2", "ap-east-edge-1"];
      const targetClusterId = targets[Math.floor(Math.random() * targets.length)];
      const cluster = clustersDb.find(c => c.id === targetClusterId);
      
      if (cluster) {
        // Trigger a simulated disaster
        const isApEast = targetClusterId === "ap-east-edge-1";
        
        cluster.status = isApEast ? "CRITICAL" : "DEGRADED";
        cluster.cpuUsage = isApEast ? 98 : 88;
        cluster.memUsage = isApEast ? 97 : 91;
        
        const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
        const serviceName = isApEast ? "redis-cache-cluster" : "user-profile-db";
        
        const newIncident: Incident = {
          id: incidentId,
          service: serviceName,
          title: isApEast ? "Memory Fragmentation Leak Alarm" : "Database Replica Sync Interrupted",
          status: "active",
          severity: isApEast ? "CRITICAL" : "HIGH",
          timestamp: "Just now",
          summary: isApEast 
            ? "Redis cache keys eviction bottleneck limit reached (100%). Pod memory usage spikes."
            : "Replication lag exceeded maximum recovery threshold (180 seconds). Ingress write block state.",
          explanation: isApEast
            ? "Inefficient cache evictions running in redis subscription pools. Memory leak introduced during configuration change."
            : "High query reading lag in secondary databases replica clusters due to missing indexed keys.",
          actionSuggested: "Rollback deployment to v2.4.0-stable code to reset cache thresholds safely.",
          impactedServices: [
            { name: serviceName, status: isApEast ? "CRITICAL" : "DEGRADED" },
            { name: "api-gateway", status: "DEGRADED" }
          ],
          logs: isApEast ? [
            "12:44:02 UTC [WARN] Redis memory consumption threshold breached (95%)",
            "12:44:10 UTC [ERROR] OOM_EVICTION_FAILED: eviction-policy: noeviction active",
            "12:44:15 UTC [FATAL] System critical limit: pod memory allocation exhausted"
          ] : [
            "12:44:02 UTC [WARN] Read replica lag higher than 120s threshold",
            "12:44:10 UTC [ERROR] SYNC_TIMEOUT_REPLICAS: read replica node failover retry",
            "12:44:15 UTC [WARN] Throttling active operations to restore secondary shard"
          ],
          timeline: [
            { time: "12:44 UTC", event: "Incident triggered by threat alert", status: "done" },
            { time: "12:45 UTC", event: "Self-healing script waiting SRE action", status: "pending" }
          ]
        };
        
        incidentsDb.unshift(newIncident);
        
        const newNotif: OperationalNotification = {
          id: `notif-${Date.now()}`,
          title: newIncident.title,
          message: newIncident.summary,
          severity: isApEast ? "critical" : "warning",
          timestamp: "Just now",
          read: false,
          clusterId: targetClusterId
        };
        
        notificationsDb.unshift(newNotif);
      }
    }
  } catch (err) {
    console.error("Error in server chaos simulation loop:", err);
  }
}, 40000);

// ------------------------------------------------------------------
// REST ENDPOINTS FOR REAL INTEGRATION
// ------------------------------------------------------------------

interface UserAccount {
  email: string;
  fullName: string;
  company: string;
  passwordHash?: string;
  createdAt: string;
}

const usersDb: UserAccount[] = [
  {
    email: "sre@nexacorp.com",
    fullName: "Elena Rostova",
    company: "NexaCorp",
    passwordHash: "password",
    createdAt: new Date().toISOString()
  }
];

interface OperationalNotification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  read: boolean;
  clusterId?: string;
}

const notificationsDb: OperationalNotification[] = [
  {
    id: "notif-01",
    title: "Cluster ap-east-edge-1 degraded",
    message: "Pod density threshold breached (100%). CPU usage at 98%. Triggering alarm protocol.",
    severity: "critical",
    timestamp: "12m ago",
    read: false,
    clusterId: "ap-east-edge-1"
  },
  {
    id: "notif-02",
    title: "CVE Assessment complete",
    message: "Federated scanner detected CVE-2023-44487 in ingress-nginx controllers.",
    severity: "warning",
    timestamp: "1h ago",
    read: false,
    clusterId: "eu-west-data-2"
  },
  {
    id: "notif-03",
    title: "Database Backup Completed",
    message: "Weekly recovery snapshot replicated to AWS S3-Glacier regions (eu-central-1). All checks passed.",
    severity: "info",
    timestamp: "4h ago",
    read: true
  }
];

// Authentication Routes
app.post("/api/auth/register", (req, res) => {
  const { email, fullName, company, password } = req.body;
  if (!email || !fullName || !company || !password) {
    return res.status(400).json({ error: "All profile registration fields are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userExists = usersDb.some(u => u.email === normalizedEmail);
  if (userExists) {
    return res.status(409).json({ error: "This email registration belongs to an active SRE profile." });
  }

  const newUser: UserAccount = {
    email: normalizedEmail,
    fullName: fullName.trim(),
    company: company.trim(),
    passwordHash: password,
    createdAt: new Date().toISOString()
  };

  usersDb.push(newUser);
  res.status(201).json({
    success: true,
    message: "Federated workspace SRE account provisioned successfully.",
    user: {
      email: newUser.email,
      fullName: newUser.fullName,
      company: newUser.company
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Both work-email and secure password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const matchedUser = usersDb.find(u => u.email === normalizedEmail);

  if (!matchedUser) {
    return res.status(401).json({ error: "Invalid credentials. No registered team domain profile matches." });
  }

  if (matchedUser.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid credentials. Secret passkeys did not match our records." });
  }

  res.json({
    success: true,
    message: "Authorized cluster access verified successfully.",
    user: {
      email: matchedUser.email,
      fullName: matchedUser.fullName,
      company: matchedUser.company
    }
  });
});

// Notification Routes
app.get("/api/notifications", (req, res) => {
  res.json(notificationsDb);
});

app.post("/api/notifications/read", (req, res) => {
  const { id } = req.body;
  if (id === "all") {
    notificationsDb.forEach(n => n.read = true);
    return res.json({ success: true, message: "All system alerts marked as read." });
  }

  const target = notificationsDb.find(n => n.id === id);
  if (!target) {
    return res.status(404).json({ error: "Notification trace could not be located in index." });
  }

  target.read = true;
  res.json({ success: true, message: "Notification dismissed successfully.", notification: target });
});

app.post("/api/notifications/trigger-simulation", (req, res) => {
  const { severity, title, message } = req.body;
  const newNotif: OperationalNotification = {
    id: `notif-${Date.now()}`,
    title: title || "AIHelm Critical Alarm Simulation",
    message: message || "Synthetic telemetry incident triggered for testing operations notification loops.",
    severity: severity || "warning",
    timestamp: "Just now",
    read: false
  };

  notificationsDb.unshift(newNotif);
  res.status(201).json(newNotif);
});

// 1. Get Clusters
app.get("/api/clusters", (req, res) => {
  res.json(clustersDb);
});

// 2. Onboard and Connect a Kubernetes Cluster (Agent-Push Architecture)
app.post("/api/onboard-cluster", (req, res) => {
  const { name, provider, region, nodes, totalNodes } = req.body;
  if (!name || !region) {
    return res.status(400).json({ error: "Missing required cluster specifications." });
  }

  // Generate an enterprise secure agent JWT key block
  const agentToken = `ah_agent_tok_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`;
  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  
  const helmCommand = `helm repo add aihelm https://charts.aihelm.com --force-update && \\
helm install aihelm-agent-${cleanName} aihelm/aihelm-agent \\
  --set tenantId="ex_tenant_nexacorp" \\
  --set agentToken="${agentToken}" \\
  --set clusterName="${cleanName}" \\
  --namespace aihelm --create-namespace`;

  const newCluster: ClusterNode = {
    id: `cluster-${Math.random().toString(36).substring(2, 9)}`,
    name: cleanName,
    provider: provider || "AWS",
    region,
    status: "HEALTHY",
    nodes: Number(nodes) || 10,
    totalNodes: Number(totalNodes) || 50,
    podDensity: Math.round(((Number(nodes) || 10) / (Number(totalNodes) || 50)) * 100),
    cpuUsage: 42,
    memUsage: 48,
    activePods: (Number(nodes) || 10) * 8,
    agentToken,
    helmCommand
  };

  clustersDb.push(newCluster);
  res.json(newCluster);
});

// 3. Get Incidents
app.get("/api/incidents", (req, res) => {
  res.json(incidentsDb);
});

// 4. Trigger Auto-Healing Rollback
app.post("/api/incidents/rollback", (req, res) => {
  const { incidentId } = req.body;
  const incident = incidentsDb.find(i => i.id === incidentId);
  if (!incident) {
    return res.status(404).json({ error: "Incident scope not found." });
  }

  // Perform self healing and resolve state
  incident.status = "resolved";
  incident.timeline.push({
    time: "SRE Automatic",
    event: "Autonomic self-healing rollback to v2.4.0-stable executed successfully.",
    status: "done"
  });

  // Restore our cluster nodes back to completely healthy states!
  clustersDb.forEach(c => {
    if (c.status !== "HEALTHY") {
      c.status = "HEALTHY";
    }
  });

  res.json({ success: true, message: `Auto healing script triggers for ${incident.service}. Rollback executed.`, incident });
});

// 5. Query Central Logs Router (Grep Search Engine)
app.get("/api/logs", (req, res) => {
  try {
    const { grep, service, level } = req.query;
    let filtered = [...staticLogPool];

    if (service && service !== "All" && service !== "") {
      const serviceStr = String(service).toLowerCase();
      filtered = filtered.filter(l => l && l.service && String(l.service).toLowerCase() === serviceStr);
    }

    if (level && level !== "All" && level !== "") {
      const levelStr = String(level).toLowerCase();
      filtered = filtered.filter(l => l && l.level && String(l.level).toLowerCase() === levelStr);
    }

    if (grep && grep !== "") {
      const q = String(grep).toLowerCase();
      filtered = filtered.filter(l => 
        l && (
          (l.message && String(l.message).toLowerCase().includes(q)) || 
          (l.service && String(l.service).toLowerCase().includes(q))
        )
      );
    }

    // Cap logs at 100 max length
    res.json(filtered.slice(-100));
  } catch (err: any) {
    console.error("Error inside GET /api/logs route handler:", err);
    res.status(500).json({ error: "Logs retrieval failed", details: err.message });
  }
});

// 6. Security Auditor scan
app.post("/api/security/scan", (req, res) => {
  // Patches existing vulnerabilities
  vulnerabilitiesDb.forEach(v => {
    if (v.status === "Open" || v.status === "Unpatched") {
      v.status = "Patched";
    }
  });
  res.json({ success: true, score: 98, patchedVulnerabilities: vulnerabilitiesDb });
});

// REST API for conversational diagnostic chats
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing chat query prompt." });
    }

    const ai = getGeminiClient();
    if (ai) {
      // Formulate a robust prompt to guide Gemini correctly as an elite AI SRE Assistant
      const systemInstruction = 
        "You are AIHelm SRE Assistant, a highly intelligent and visually polished synthetic precision AI operations assistant. " +
        "You help engineers troubleshoot Kubernetes workloads, database latencies, CI/CD rollbacks, logs, and CVE patches. " +
        "When diagnosing, structure your answer using Markdown with clear bold terms, SRE terminology, and action suggestions.";

      const contents = [];
      
      // Inject conversation history nicely
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          });
        }
      }
      
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || "I am currently monitoring cluster nodes. No anomaly detected.";
      return res.json({ response: text });
    } else {
      // Seamless intelligent simulation fallback if no API key is set
      setTimeout(() => {
        const text = getFallbackSREAnswer(message);
        return res.json({ response: text });
      }, 800); // realistic AI response delay
    }
  } catch (error: any) {
    console.error("Gemini SRE Chat Error:", error);
    return res.status(500).json({ error: error.message || "Internal diagnostic agent timeout." });
  }
});

// App routing and static assets middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AIHelm server running on port ${PORT}`);
  });
}

startServer();

