import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Key, 
  RefreshCw, 
  Check, 
  Database, 
  Cpu, 
  Zap, 
  Terminal, 
  LogOut, 
  Laptop, 
  Compass, 
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "motion/react";

export const ProfilePanel: React.FC = () => {
  const {
    userFullName,
    setUserFullName,
    userEmail,
    setUserEmail,
    userCompany,
    setUserCompany,
    setIsLoggedIn,
    clusters,
    chatHistory,
    vulnerabilities
  } = useOps();

  // Local state for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userFullName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [companyInput, setCompanyInput] = useState(userCompany);
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SRE Custom Operational States
  const [activeRole, setActiveRole] = useState<string>("Lead SRE Operator");
  const [sshKey, setSshKey] = useState<string>("ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQg6M3vP... [aihelm-operator]");
  const [apiToken, setApiToken] = useState<string>("ah_tok_abc123xyz789_v1");
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);
  const [isRegeneratingSsh, setIsRegeneratingSsh] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserFullName(nameInput);
    setUserEmail(emailInput);
    setUserCompany(companyInput);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const regenerateToken = () => {
    setIsRegeneratingToken(true);
    setTimeout(() => {
      const randStr = Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      setApiToken(`ah_tok_${randStr}_v1`);
      setIsRegeneratingToken(false);
    }, 800);
  };

  const regenerateSshKey = () => {
    setIsRegeneratingSsh(true);
    setTimeout(() => {
      const randSig = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
      setSshKey(`ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ${randSig}... [aihelm-operator-reg]`);
      setIsRegeneratingSsh(false);
    }, 800);
  };

  // Profile Roles
  const ROLES = [
    { name: "Lead SRE Operator", desc: "Full control plane write permission. Orchestrates auto-healing playbooks.", access: "Tier-1 Administrative Access" },
    { name: "Chaos Engineer", desc: "Injects container latency to proof cluster resilience.", access: "Tier-2 Operational Access" },
    { name: "SecOps Administrator", desc: "Schedules Docker vulnerability scanners and applies patches.", access: "Tier-1 Compliance Access" },
    { name: "DevOps Architect", desc: "Monitors CI/CD pipeline deployments and configures ingress routes.", access: "Tier-2 Deployment Access" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper Profile Hero & Avatar Banner */}
      <div className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-[#121622]/90 to-[#0e111a]/95 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* SRE Operator Circular Gradient Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 p-1 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full rounded-full bg-[#090b14] flex items-center justify-center text-4xl font-extrabold text-[#ebeefc] uppercase select-none">
                {userFullName.slice(0, 2)}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 border-2 border-[#090b14] rounded-full animate-pulse" title="Operator online"></div>
          </div>

          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">{userFullName}</h1>
              <span className="px-2.5 py-0.5 text-[9.5px] uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-bold font-mono">
                {activeRole}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              SRE Command Center Operator Profile • <span className="text-sky-300 font-semibold">{userCompany} Workspace</span>
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
              <span>Host IP: <strong className="text-slate-400">10.244.0.12</strong></span>
              <span>•</span>
              <span>Managed Clusters: <strong className="text-slate-400">{clusters.length || 3}</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-emerald-400">AUTHORIZED_SHELL</strong></span>
            </div>
          </div>

          <div className="flex md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (!isEditing) {
                  setNameInput(userFullName);
                  setEmailInput(userEmail);
                  setCompanyInput(userCompany);
                }
                setIsEditing(!isEditing);
              }}
              className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold tracking-wide text-white transition-all cursor-pointer flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              {isEditing ? "Cancel Updates" : "Edit Operator Details"}
            </button>
            
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-4 py-2 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-semibold tracking-wide text-rose-400 transition-all cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Workspace
            </button>
          </div>
        </div>

        {/* Live Interactive Notification Alert for configuration */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            Operator SRE registration credentials successfully written to local database index files.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - SRE Profile Form and Roles */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main profile forms container */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-sky-400" />
              {isEditing ? "Modify Operator Credentials" : "Operator Credentials"}
            </h2>

            {isEditing ? (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Full Operator Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-[#090b14] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Workforce Company</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        className="w-full bg-[#090b14] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-mono text-slate-400">Secured Operator Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-[#090b14] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-mono rounded-lg cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono rounded-lg cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Read-only display credentials
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block">Operator Full Name</span>
                  <span className="text-sm font-semibold text-white">{userFullName}</span>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block">Organization</span>
                  <span className="text-sm font-semibold text-white">{userCompany}</span>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 space-y-1 sm:col-span-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block">System Communications Email</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white font-mono">{userEmail}</span>
                    <span className="px-1.5 py-0.5 text-[8.5px] uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-mono font-bold">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.01] border border-white/5 space-y-1 sm:col-span-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 block">Operator Passkey Hash</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono tracking-widest bg-black/20 px-2 py-1 rounded">
                      {showPassword ? "NexaAuthSecureSRE_Pass_2026!" : "••••••••••••••••••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SRE Designation / Custom Role Picker */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Operator Role Authorization
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Select active permission node</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ROLES.map((role) => {
                const isActive = activeRole === role.name;
                return (
                  <div
                    key={role.name}
                    onClick={() => setActiveRole(role.name)}
                    className={`p-4 rounded-lg border cursor-pointer text-left transition-all duration-200 group/role relative ${
                      isActive 
                        ? "bg-purple-950/15 border-purple-500/30 shadow-[0_2px_15px_rgba(139,92,246,0.1)]" 
                        : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className={`text-xs font-bold group-hover/role:text-purple-300 transition-colors ${isActive ? "text-purple-300" : "text-white"}`}>
                        {role.name}
                      </h4>
                      {isActive && (
                        <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-purple-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed mb-2">
                      {role.desc}
                    </p>
                    <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider block">
                      Security Token: {role.access}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Dashboard Settings - SRE Credentials, Statistics, Session Info */}
        <div className="space-y-6">
          
          {/* SRE Stats Card */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Telemetry Index Statistics
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#171c2a] border border-white/5 rounded-lg">
                <span className="text-[9.5px] uppercase tracking-wider font-mono text-slate-500">Service Nodes</span>
                <p className="text-xl font-bold font-mono text-white mt-1">{clusters.reduce((sum, c) => sum + c.nodes, 0) || 200}</p>
              </div>

              <div className="p-3 bg-[#171c2a] border border-white/5 rounded-lg">
                <span className="text-[9.5px] uppercase tracking-wider font-mono text-slate-500">Threat CVEs</span>
                <p className="text-xl font-bold font-mono text-rose-400 mt-1">{vulnerabilities.filter(v => v.status !== "Patched").length}</p>
              </div>

              <div className="p-3 bg-[#171c2a] border border-white/5 rounded-lg col-span-2">
                <span className="text-[9.5px] uppercase tracking-wider font-mono text-slate-500">Diagnostic Logs Searched</span>
                <p className="text-xl font-bold font-mono text-indigo-300 mt-1">4,912 Lines</p>
              </div>
            </div>
          </div>

          {/* SRE Credentials Section (SSH Key generation and API scopes) */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              API & Cloud Credentials
            </h2>

            {/* Simulated SSH RSA Key pair */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400 font-mono">SSH Public Host Key</span>
                <button
                  onClick={regenerateSshKey}
                  disabled={isRegeneratingSsh}
                  className="text-[9.5px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegeneratingSsh ? "animate-spin" : ""}`} />
                  Regen Key
                </button>
              </div>
              <textarea
                readOnly
                value={sshKey}
                className="w-full bg-[#0d0f1b] border border-white/5 rounded p-2 text-[10px] font-mono text-slate-400 h-16 resize-none block focus:outline-none"
              />
            </div>

            {/* API Bearer Sockets Token */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-400 font-mono">Operations REST Bearer JWT</span>
                <button
                  onClick={regenerateToken}
                  disabled={isRegeneratingToken}
                  className="text-[9.5px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegeneratingToken ? "animate-spin" : ""}`} />
                  Regen Token
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={apiToken}
                className="w-full bg-[#0d0f1b] border border-white/5 rounded px-2 py-1.5 text-[10.5px] font-mono text-[#ebeefc] block focus:outline-none"
              />
            </div>
          </div>

          {/* Active Terminal Sessions (Simulated security auditing) */}
          <div className="p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-sky-400" />
                Active Session Terminals
              </h2>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-400">
              <div className="p-2.5 rounded bg-black/25 border border-white/5 flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold">Chrome (Desktop Client)</p>
                  <p className="text-[9px] text-slate-500">Taipei, TW • 157.42.10.8</p>
                </div>
                <span className="text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                  Current
                </span>
              </div>

              <div className="p-2.5 rounded bg-black/25 border border-white/5 flex justify-between items-start opacity-70">
                <div>
                  <p className="text-white font-semibold flex items-center gap-1">Edge CLI Daemon</p>
                  <p className="text-[9px] text-slate-500">AWS us-east-1 pod-sre-7a</p>
                </div>
                <span className="text-[8px] bg-slate-500/10 text-slate-400 border border-white/10 px-1.5 py-0.2 rounded font-bold uppercase">
                  Connected
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
