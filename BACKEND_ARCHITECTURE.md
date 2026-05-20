# AIHelm Backend Operations Manual & System Architecture
## Enterprise-Grade Cloud-Native Incident Management & Auto-Healing Platform

This document describes the complete enterprise backend architecture, database schema design, Kubernetes agent workflow, event-driven design, AI incident analysis pipelines, security posture, and deployment strategies for **AIHelm**.

---

## 1. System Topology Overview
AIHelm is designed as a highly available, multi-tenant, microservices-driven platform. The architecture separates the **Control Plane** (AIHelm Hosted Platform in Azure) from the **Data Plane** (Customer Kubernetes Clusters running the AIHelm secure Agent).

```
+-------------------------------------------------------------------------------------------------+
|                                 CUSTOMER KUBERNETES CLUSTERS                                    |
|                                                                                                 |
|   +-----------------------+              +-----------------------+                              |
|   |   Prod AKS Cluster    |              |   Stage AKS Cluster   |                              |
|   |                       |              |                       |                              |
|   |  [FluentBit] [Prom]   |              |  [FluentBit] [Prom]   |                              |
|   |           |           |              |           |           |                              |
|   |     [AIHelm Agent]    |              |     [AIHelm Agent]    |                              |
+---------+-----------------+----------------------+---------------+------------------------------+
          | (Secure gRPC / mTLS via Port 443)      |
          v                                        v
+---------+----------------------------------------+----------------------------------------------+
|                              AIHELM CORE HOSTED SAAS PLATFORM (AZURE)                           |
|                                                                                                 |
|   +-----------------------------------------------------------------------------------------+   |
|   |                       API GATEWAY & INGRES LAYER (Kong / mTLS Proxy)                     |   |
|   +------------------------------------+----------------------------------------------------+   |
|                                        | (Internal Route Mesh)                                  |
|                                        v                                                        |
|   +-----------------------------------------------------------------------------------------+   |
|   |                              INTERNAL SERVICE MESH (Linkerd)                            |   |
|   |                                                                                         |   |
|   |  +------------------+  +------------------+  +------------------+  +------------------+ |   |
|   |  |   Auth Service   |  | Cluster Manager  |  |  Metrics Service |  | Logging Service  | |   |
|   |  +------------------+  +------------------+  +------------------+  +------------------+ |   |
|   |  +------------------+  +------------------+  +------------------+  +------------------+ |   |
|   |  | AI Incident Svc  |  |  AI ChatOps Svc  |  |  Auto-Healing    |  |  CI/CD Monitor   | |   |
|   |  +------------------+  +------------------+  +------------------+  +------------------+ |   |
|   |  +------------------+  +------------------+                                             |   |
|   |  | Security Service |  | Notification Svc |                                             |   |
|   |  +------------------+  +------------------+                                             |   |
|   +------------------------------------+----------------------------------------------------+   |
|                                        |                                                        |
|                                        v                                                        |
|   +------------------------------------+----------------------------------------------------+   |
|   |                   EVENT MESSAGE BROKER & STREAM PROCESSING (Apache Kafka)               |   |
|   +------------------------------------+----------------------------------------------------+   |
|                                        |                                                        |
|         +------------------------------+------------------------------+                         |
|         |                              |                              |                         |
|         v                              v                              v                         |
|  +---------------+              +--------------+              +---------------+                 |
|  | PostgreSQL    |              | Redis Cache  |              | PgVector DB   |                 |
|  | (Multi-Tenant)|              | (Rates/Locks)|              | (RAG Context) |                 |
|  +---------------+              +--------------+              +---------------+                 |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Microservice Architecture Deep Dive

AIHelm features 11 core microservices styled around domain-driven patterns, built using **Python FastAPI** to achieve high concurrency, asynchronous core processing, and native typing.

### 11 Core Microservices:
1.  **API Gateway Service**: 
    *   **Tech**: Kong Gateway / custom FastAPI routers.
    *   **Responsibilities**: Global ingress controls, JWT parsing, rate limiting (via Token Bucket algorithm backed by Redis), route aggregation, SSL termination.
2.  **Authentication/Tenant Service**:
    *   **Responsibilities**: Handles user registration, multi-tenant domain mapping (logical separation using tenant ID columns), Azure Active Directory SSO integration, Role-Based Access Control (RBAC) (Owner, Admin, SRE, Viewer).
3.  **Cluster Management Service**:
    *   **Responsibilities**: Manages customer Kubernetes cluster registration. Generates secure cluster configuration maps, JWT deployment tokens, and validates Agent ping connectivity.
4.  **Monitoring Service**:
    *   **Responsibilities**: Ingests Prometheus metrics downstream. Hosts query engine to formulate PromQL metrics, handles threshold evaluations, and publishes alerts onto Kafka.
5.  **Logging Service**:
    *   **Responsibilities**: Aggregates structured JSON logs streamed from Fluent Bit or Loki. Enables hyper-fast log queries using indexing over metadata channels.
6.  **AI Incident Analysis Service**:
    *   **Responsibilities**: Automated log cluster anomaly analyses. Maps failed traces to Gemini embeddings, summarizes failure root-causes, and dynamically links similar post-mortems.
7.  **AI ChatOps Service**:
    *   **Responsibilities**: Interactive conversational DevOps SRE assistant. Implements Retrieval-Augmented Generation (RAG) over cluster manifests, K8s documents, and local playbooks.
8.  **Auto-Healing Service**:
    *   **Responsibilities**: Executes autonomic self-healing commands (restarting pods, scaling deployments, trigger rollbacks) via Kubernetes Webhook API securely governed by safety threshold rules.
9.  **CI/CD Monitoring Service**:
    *   **Responsibilities**: Monitors Git workflow webhooks (GitHub Actions, Jenkins triggers). Traces git release hashes to cluster deployments to establish timeline correlation analysis.
10. **Security Service**:
    *   **Responsibilities**: Trivy security vulnerability scanner integration. Parses Kubernetes image CVE scans, executes RBAC configuration audits against CIS benchmarks, and suggests security patches.
11. **Notification Service**:
    *   **Responsibilities**: Distributes critical alert incidents (Slack, MSTeams, PagerDuty, Email) using dynamic retry templates with adaptive backoffs.

---

## 3. Agent-Based Architecture & Secure Connections

Securely monitoring client infra without exposing their APIs is critical. AIHelm implements an **agent-push model**:

```
+---------------------------------------------------------+
|                  CUSTOMER AKS CLUSTER                   |
|                                                         |
|  [Your App Pod]        [Your App Pod]   [System Event]  |
|         \                    /                 |        |
|          v                  v                  v        |
|     +--------------------------------------------+      |
|     |            Prometheus + Fluent Bit         |      |
|     +---------------------+----------------------+      |
|                           | (Local Scrape / Tail)       |
|                           v                             |
|     +--------------------------------------------+      |
|     |            AIHELM K8S SECTOR AGENT         |      |
|     |  - Runs as DaemonSet containing SRE agent  |      |
|     |  - Uses ServiceAccount [aihelm-agent-sa]   |      |
|     |  - Secure Read-Only RBAC (except remedial) |      |
|     +---------------------+----------------------+      |
+---------------------------|-----------------------------+
                            |
                            | (mTLS HTTPS / Port 443)
                            v
+---------------------------------------------------------+
|            AIHELM CONTROL PLANE (SAAS HOUSING)          |
|                                                         |
|  [Kong Ingress Gateway]                                 |
|  - Validates Client certificate                         |
|  - Validates Agent API token (Header: X-Agent-Token)     |
|                           |                             |
|                           v                             |
|  [Cluster Manager Service]                              |
+---------------------------------------------------------+
```

### Installation Steps (Helm-based):
The agent installs with a single clean Helm command:
```bash
helm repo add aihelm https://charts.aihelm.com
helm install aihelm-agent aihelm/aihelm-agent \
  --set tenantId="tenant_9410-abc" \
  --set agentToken="ah_agent_tok_2026_05_20" \
  --set clusterName="production-east-aks" \
  --namespace aihelm --create-namespace
```

### Agent Security Mechanics:
1.  **RBAC Limit Policy**: The Agent service account is restricted via a custom K8s ClusterRole to read metrics and logs. Writing/deleting resources is restricted exclusively to specific auto-healing namespaces if enabled.
2.  **No Ingress Allowed**: Customer clusters do not expose an open port to the internet. The agent initiates outgoing connections to AIHelm (`https://agent.aihelm.com/api/v1/stream`) via secure websockets over TLS.
3.  **Communication mTLS**: Traffic is protected with mutually authenticated TLS (mTLS) where each customer cluster agent carries a unique, rotatable certificate injected inside a Kubernetes Secret.

---

## 4. Multi-Tenant PostgreSQL Database Schema

To scale securely to thousands of organizations, AIHelm implements a multi-tenant relational system with **Row-Level Security (RLS)** in PostgreSQL. This prevents cross-tenant data visible leaks.

```sql
-- PostgreSQL DDL Script for AIHelm Control Plane

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations (Tenants) Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'SRE' NOT NULL, -- 'ADMIN', 'SRE', 'VIEWER'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index on tenant lookup
CREATE INDEX idx_users_org ON users(organization_id);

-- 3. Kubernetes Clusters Table
CREATE TABLE clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) DEFAULT 'Azure' NOT NULL, -- 'Azure', 'AWS', 'GCP', 'On-Prem'
    region VARCHAR(50) NOT NULL,
    agent_token_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'HEALTHY' NOT NULL, -- 'HEALTHY', 'DEGRADED', 'CRITICAL', 'UNREACHABLE'
    cpu_limit_cores INT NOT NULL,
    mem_limit_bytes BIGINT NOT NULL,
    k8s_version VARCHAR(30),
    last_ping_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_tenant_cluster_name UNIQUE (organization_id, name)
);

CREATE INDEX idx_clusters_tenant ON clusters(organization_id);

-- 4. Alerts / Anomaly Incidents Table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(30) NOT NULL, -- 'CRITICAL', 'HIGH', 'WARNING', 'INFO'
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'
    summary TEXT,
    root_cause TEXT,
    suggested_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_incidents_tenant_active ON incidents(organization_id, status) WHERE status = 'ACTIVE';

-- 5. Logs Annotation & Vectors Table (pgvector optional integration)
CREATE TABLE logs_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    level VARCHAR(20) NOT NULL,
    raw_message TEXT NOT NULL,
    log_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    embedding vector(1536) -- For semantic vector searches (Gemini / OpenAI embeddings)
);

-- Indexing for logs time and service searches
CREATE INDEX idx_logs_search ON logs_metadata (organization_id, service_name, log_timestamp DESC);

-- 6. Dynamic Auto-Healing Remediators Table
CREATE TABLE auto_remediations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'RESTART_POD', 'ROLLBACK_RELEASE', 'SCALE_REPLICAS'
    parameters JSONB,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'APPROVED', 'EXECUTED', 'FAILED'
    safety_audit_ok BOOLEAN DEFAULT FALSE NOT NULL,
    executor_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row-Level Security on all core operational tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_remediations ENABLE ROW LEVEL SECURITY;

-- Dynamic tenant extraction policy helpers
CREATE POLICY tenant_user_isolation_policy ON users 
    FOR ALL USING (organization_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_cluster_isolation_policy ON clusters 
    FOR ALL USING (organization_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_inc_isolation_policy ON incidents 
    FOR ALL USING (organization_id = current_setting('app.current_tenant_id')::uuid);
```

---

## 5. Event-Driven Architecture (Kafka Topologies)

To decoupling logging streams and telemetry analytical jobs from live user view endpoints, AIHelm leverages **Kafka** for event choreography:

```
                  +-------------------------+
                  |  Customer Agent Ingress |
                  +------------+------------+
                               | (HTTP Stream)
                               v
                  +------------+------------+
                  |    API Gateway Router   |
                  +------------+------------+
                               |
                               v
                  +------------+------------+
                  |   FastAPI Kafka Producer|
                  +------------+------------+
                               |
       +-----------------------+-----------------------+
       | [Telemetry Partition]                         | [Auto-Healing Channel]
       v                                               v
+------+-----------------------+               +-------+-----------------------+
|  Topic: telemetry.raw-logs   |               | Topic: autohealing.triggered  |
+------+-----------------------+               +-------+-----------------------+
       |                                               |
       +-----------------------+                       |
       | (Stream Analysis)     | (Embeddings)          |
       v                       v                       v
+------+---------+      +------+---------+      +------+---------+
| Loki / Fluent  |      | AI Incident Svc|      | Remediation    |
| ingestion      |      | Vector Store   |      | Executor       |
+----------------+      +----------------+      +----------------+
```

### Event Payload Examples:

#### Event: `incident.created`
```json
{
  "eventId": "evt_9fa102-bc32",
  "eventType": "incident.created",
  "timestamp": "2026-05-20T10:46:49Z",
  "payload": {
    "tenantId": "tnt_nexacorp-829",
    "incidentId": "INC-2024-089",
    "clusterId": "us-east-prod-1",
    "service": "payment-processor",
    "severity": "CRITICAL",
    "symptom": "OOMKilled count peaked to 8 restarts within 5m"
  }
}
```

#### Event: `autohealing.triggered`
```json
{
  "eventId": "evt_1a8d01-63bc",
  "eventType": "autohealing.triggered",
  "timestamp": "2026-05-20T10:48:00Z",
  "payload": {
    "tenantId": "tnt_nexacorp-829",
    "incidentId": "INC-2024-089",
    "remediationId": "rem_8fb2-901d-ca",
    "actionType": "ROLLBACK_RELEASE",
    "targetResource": "deployments/payment-processor-svc",
    "targetVersion": "v2.4.0-stable"
  }
}
```

---

## 6. SRE AI Vector & Semantic-Search Pipeline

Log datasets are chaotic, noisy and heavy. The AIHelm RAG architecture handles high-velocity logs ingestion using structural chunks:

```
[Incoming Log Stream File] 
  -> Chunk Log Processor (Rolling buffer of 20 logs containing stack-trace)
  -> Compute hash (de-duplicate similar repeats)
  -> Vector Generation API (ai.models.generateContent via GoogleGenAI embeddings client)
  -> Store inside pgvector database table
  -> High-speed nearest-neighbor cosine SRE match analysis 
```

### Prompt-Context Generator Workflow:
When a user asks **"Why is payment-processor crashing?"**, the AI ChatOps System fetches:
1.  **Semantic Logs**: Cosine similarities `SELECT raw_message FROM logs_metadata WHERE embedding <=> ? LIMIT 5`.
2.  **Live Telemetry Status**: Current Memory capacity load, CPU usages, active pod replica counts.
3.  **Active Incidents**: Recent alert records.
4.  **Generative AI Pipeline context format**:
```markdown
System Instruction: You are an expert Staff SRE. Diagnose the incident using the context.
Context Parameters:
- Cluster Stats: us-east-prod-1 is DEGRADED. CPU is 68%, Memory is 94%.
- Related Logs:
  - 10:04:15 UTC [ERROR] DB_CONN_TIMEOUT: Failed to acquire connection from pool after 5000ms
  - 10:04:20 UTC [WARN] Circuit breaker tripped for payment-gateway downstream
- Active Incident: "INC-2024-089 payment-processor timeout"
Prompt Question: Why is the payment-processor crashing?
```

---

## 7. Kubernetes Python Controller Engine

To interact directly with the Kubernetes client on the clusters, AIHelm hosts an autonomic worker controller built on the **kubernetes-client** package.

```python
# Reference Implementation of the AIHelm Autonomic Remediation Watcher
import os
import json
from kubernetes import client, config, watch

def init_k8s_client():
    if "KUBERNETES_SERVICE_HOST" in os.environ:
        config.load_incluster_config()
    else:
        config.load_kube_config()
    return client.CoreV1Api(), client.AppsV1Api()

def watch_pod_failures(namespace="default"):
    core_api, apps_api = init_k8s_client()
    w = watch.Watch()
    
    print(f"[*] AIHelm Watcher Engine listening to pods in namespace: {namespace}...")
    for event in w.stream(core_api.list_pods_for_all_namespaces, timeout_seconds=0):
        pod = event['object']
        event_type = event['type']
        
        # Look for Pods in unhealthy states
        status = pod.status
        if status.container_statuses:
            for container in status.container_statuses:
                state = container.state
                # Check for OOMKilled or CrashLoopBackOff states
                if state.waiting and state.waiting.reason in ["CrashLoopBackOff", "ErrImagePull"]:
                    trigger_anomaly_alert(pod.metadata.name, state.waiting.reason)
                elif state.terminated and state.terminated.reason == "OOMKilled":
                    trigger_oom_alert(pod.metadata.name)

def trigger_oom_alert(pod_name):
    print(f"[!] ANOMALY READOUT: Pod {pod_name} was terminated by OOMKilled!")
    # Publish and pipe directly into telemetry Kafka queue 

def execute_deployment_rollback(namespace, deployment_name):
    core_api, apps_api = init_k8s_client()
    print(f"[*] AUTO-HEALING: Initiating secure rollback of {deployment_name}...")
    
    # Read deployment detail history
    deployment = apps_api.read_namespaced_deployment(deployment_name, namespace)
    
    # Apply rollback configurations (change image tag label fallback)
    deployment.spec.template.spec.containers[0].image = "nexacorp/payment-processor:v2.4.0-stable"
    apps_api.patch_namespaced_deployment(deployment_name, namespace, deployment)
    print(f"[✓] AUTO-HEALED: Pod patched and promoted.")
```

---

## 8. Safety-First Auto-Healing Rollback Policy

Autonomic mitigation engines can cause outage cascades if not properly gatekept. AIHelm incorporates an **Automated Safety Gate**:

```
[Incident Detected]
       |
       v
[Validate Safety Policies]
  - Are there other active rollout rollbacks in progress? (Max 1 concurrent)
  - Has this service been rolled back in the last 4 hours? (Prevent loops)
  - Is the current error rate decreasing?
       |
  +----+----+
  |         |
[Passed] [Failed Policies]
  |         |
  v         v
[Execute Auto-Heal] [Trigger Emergency Alert + Request SRE Manual Confirmation]
```

These gates ensure self-healing routines never initiate cyclic loops or cascade failures on critical infrastructure assets.

---

## 9. Observability & Telemetry Framework (SRE Golden Signals)

AIHelm captures the **Four Golden Signals** (Latency, Traffic, Errors, and Saturation) to monitor cluster and microservice SLA patterns:

1.  **Latency**: Time taken to service a request. Captured using OpenTelemetry middleware endpoints measuring distribution buckets.
2.  **Traffic**: A measure of service demand (e.g. HTTP requests per second). Scraped by Prometheus, plotted in high-performance graphs.
3.  **Errors**: Rate of requests that fail. Logs parser watches for HTTP 5xx codes, core dumps, and stack traces.
4.  **Saturation**: Platform capacity constraints (Memory metrics, Disk I/O, Node worker count).

Grafana Loki dashboard filters logs dynamically based on the metadata scraped and aggregated by Loki indexes.

---

## 10. Core Folder Project Structure

This directory structure demonstrates how a real production microservice setup for AIHelm is organized:

```
aihelm/
├── api-gateway/                      # Kong / FastAPI reverse proxy gateway service
├── services/
│   ├── auth/                         # RBAC, tenant organization user validations
│   ├── cluster-manager/              # AKS registers, Kubernetes ServiceAccounts
│   ├── monitoring/                   # Prometheus query proxies and alert ingest engines
│   ├── logging-service/              # Central log streaming and Loki routers
│   ├── ai-incident-analyzer/         # Gemini log summaries and embedding maps
│   ├── auto-healing/                 # K8s python script executors and remediation
│   └── security/                     # Trivy scan parsers and CVE reports
├── shared-library/                   # Shared schemas, telemetry classes, DB engines
│   ├── src/
│   │   ├── database.py               # PostgreSQL pool connection
│   │   ├── kafka_producer.py         # Standardized telemetry envelope producer
│   │   └── security_jwt.py           # Standard JWT decryption
├── deployments/                      # Kubernetes deployment manifests
│   ├── helm/
│   │   ├── aihelm-control-plane/     # SaaS control platform Helm chart
│   │   └── aihelm-agent/             # Customer Cluster Agent Helm chart
│   └── terraform/
│       ├── azure-infra.tf            # Dedicated Azure resources (AKS, PostgreSQL DB, KeyVault)
│       └── variables.tf
└── .github/
    └── workflows/
        └── cicd-pipeline.yml         # GitHub Actions testing, scanning, canaries
```

This operations manual details the rigorous engineering details required to drive AIHelm's automated SRE cockpit safely.
