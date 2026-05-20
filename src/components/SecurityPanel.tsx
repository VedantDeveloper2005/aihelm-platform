import React from "react";
import { useOps } from "../context/OperationalContext";
import { Severity } from "../types";
import { 
  ShieldAlert, 
  CheckCircle,
  AlertTriangle,
  Zap,
  Play,
  Activity,
  Heart,
  Settings,
  HelpCircle,
  FileText,
  Lock,
  Search,
  Shield,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const SecurityPanel: React.FC = () => {
  const { 
    vulnerabilities, 
    setVulnerabilities, 
    isTriggeringScan, 
    triggerSecScan, 
    complianceScore 
  } = useOps();

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL:
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20">
            CRITICAL
          </span>
        );
      case Severity.HIGH:
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/15">
            HIGH
          </span>
        );
      case Severity.MEDIUM:
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/15">
            MEDIUM
          </span>
        );
      case Severity.LOW:
        return (
          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/15">
            LOW
          </span>
        );
    }
  };

  const handlePatchVulnerability = (id: string) => {
    setVulnerabilities((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, status: "Patched" } : v
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner controls row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-purple-400" />
            DevSecOps Security Audit
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time compliance posture, static dependencies CVE scanners.
          </p>
        </div>

        <button 
          disabled={isTriggeringScan}
          onClick={triggerSecScan}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-2 shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          {isTriggeringScan ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Scanning vulnerabilities...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-purple-200" />
              Trigger Security Scan
            </>
          )}
        </button>
      </div>

      {/* Compliance indicators row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Compliance Posture visual gauge */}
        <div className="xl:col-span-4 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full"></div>
          
          <div>
            <h3 className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-2">Compliance Score</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-extrabold font-mono text-purple-300">{complianceScore}%</span>
              <span className="text-xs text-slate-500 font-mono">CIS Benchmark</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="w-full bg-[#1c2132] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${complianceScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-3">
              {complianceScore >= 90 ? "Excellent security stance compliant." : "Action required for 3 unpatched warnings."}
            </p>
          </div>
        </div>

        {/* Security Summary breakdown card */}
        <div className="xl:col-span-8 p-6 rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-300 font-mono uppercase mb-4">Risk Profile Analysis</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow items-center">
            <div className="p-4 rounded-lg bg-[#161a29] border border-white/5 text-center">
              <span className="text-rose-400 text-lg font-bold font-mono">1</span>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Critical CVEs</p>
            </div>

            <div className="p-4 rounded-lg bg-[#161a29] border border-white/5 text-center">
              <span className="text-amber-400 text-lg font-bold font-mono">1</span>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">High Risk</p>
            </div>

            <div className="p-4 rounded-lg bg-[#161a29] border border-white/5 text-center">
              <span className="text-sky-400 text-lg font-bold font-mono">1</span>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Medium Risk</p>
            </div>

            <div className="p-4 rounded-lg bg-[#161a29] border border-white/5 text-center">
              <span className="text-emerald-400 text-lg font-bold font-mono">10</span>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Patched Scopes</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pl-2">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Critical warning detected: ingress-nginx requires update parsing HTTP/2 floods.
          </div>
        </div>

      </div>

      {/* Vulnerabilities directory matches search query list */}
      <div className="rounded-xl border border-white/10 bg-[#121622]/60 backdrop-blur-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#121622]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Detected CVE vulnerabilities Directory
          </h3>
          <span className="text-xs font-mono text-slate-500">Live Static Scan</span>
        </div>

        {/* List Tables */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#171c2b] text-slate-400 font-mono">
                <th className="py-3.5 px-6 font-semibold">Vulnerability CVE</th>
                <th className="py-3.5 px-6 font-semibold">Impacted Resource</th>
                <th className="py-3.5 px-6 font-semibold">Namespace Context</th>
                <th className="py-3.5 px-6 font-semibold">CVSS v3 Score</th>
                <th className="py-3.5 px-6 font-semibold text-center">Severity</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id} className="hover:bg-white/[0.02] transition-colors leading-[1.8]">
                  <td className="py-4 px-6 font-bold font-mono text-sky-400 uppercase">{vuln.cve}</td>
                  <td className="py-4 px-6 font-mono font-medium text-slate-300">{vuln.resource}</td>
                  <td className="py-4 px-6 font-mono text-slate-500">{vuln.namespace}</td>
                  <td className="py-4 px-6 font-mono text-slate-300">{vuln.cvss}</td>
                  <td className="py-4 px-6 text-center">{getSeverityBadge(vuln.severity)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                      vuln.status === "Patched" 
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        : vuln.status === "In Progress"
                        ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                        : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                    }`}>
                      {vuln.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono">
                    {vuln.status === "Patched" ? (
                      <span className="text-slate-500 font-semibold inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Repaired
                      </span>
                    ) : (
                      <button 
                        onClick={() => handlePatchVulnerability(vuln.id)}
                        className="px-3 py-1 bg-purple-500/10 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded cursor-pointer transition-colors"
                      >
                        Auto-Fix Patch
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
