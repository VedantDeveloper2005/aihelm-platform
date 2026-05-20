import React, { useState } from "react";
import { useOps } from "../context/OperationalContext";
import { Lock, Mail, User, ShieldCheck, Terminal, Compass, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export const AuthScreens: React.FC = () => {
  const { 
    setIsLoggedIn, 
    setUserEmail, 
    setUserFullName, 
    setUserCompany 
  } = useOps();

  const [isSignUp, setIsSignUp] = useState(false);
  const [emailForm, setEmailForm] = useState("sre@nexacorp.com");
  const [nameForm, setNameForm] = useState("Elena Rostova");
  const [companyForm, setCompanyForm] = useState("NexaCorp");
  const [passwordForm, setPasswordForm] = useState("password");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const toggleMode = () => {
    const nextMode = !isSignUp;
    setIsSignUp(nextMode);
    setErrorText(null);
    setSuccessText(null);
    if (nextMode) {
      // Clear forms for custom signup
      setEmailForm("");
      setNameForm("");
      setCompanyForm("");
      setPasswordForm("");
    } else {
      // Restore demo defaults for easy login
      setEmailForm("sre@nexacorp.com");
      setNameForm("Elena Rostova");
      setCompanyForm("NexaCorp");
      setPasswordForm("password");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText(null);
    setSuccessText(null);

    try {
      if (isSignUp) {
        // Sign-up process
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailForm,
            fullName: nameForm,
            company: companyForm,
            password: passwordForm
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Workspace creation failed.");
        }

        setSuccessText(data.message || "Account provisioned successfully! Switching to authorization panel.");
        
        // Wait 1.5s then switch back to login mode so user can sign in
        setTimeout(() => {
          setIsSignUp(false);
          setPasswordForm(passwordForm); // Keep the typed password to make it easy
          setSuccessText("Please enter your password to authorize your SRE cockpit.");
        }, 1500);

      } else {
        // Log-in process
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailForm,
            password: passwordForm
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Workspace Authorization failed.");
        }

        setUserEmail(data.user.email);
        setUserFullName(data.user.fullName);
        setUserCompany(data.user.company);
        
        // Brief authorization success visual delay
        setSuccessText("Access Authorized! Decrypting telemetry nodes...");
        setTimeout(() => {
          setIsLoggedIn(true);
        }, 800);
      }
    } catch (err: any) {
      setErrorText(err.message || "A network error occurred while establishing secure connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05070f] flex items-center justify-center p-4 relative select-none">
      
      {/* Decorative background stars & nebula rays */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-sky-500/5 blur-[100px] rounded-full pointer-events-none"></div>
 
      {/* Main card box container */}
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0e18]/80 backdrop-blur-xl overflow-hidden shadow-[2px_10px_50px_rgba(0,0,0,0.8)] relative z-10 flex flex-col p-6 items-stretch space-y-5">

        {/* Brand headers */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 border border-purple-500/20 flex items-center justify-center shadow-lg">
            <Compass className="w-5.5 h-5.5 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-white font-sans">
            AIHelm Control Plane
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? "Configure a new federated SRE operator profile." : "Sign in to check federated cluster health channels."}
          </p>
        </div>

        {/* Error notification banner */}
        {errorText && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex gap-2 items-start text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Success notification banner */}
        {successText && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex gap-2 items-start text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successText}</span>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Full Name</label>
              <div className="flex items-center bg-[#151928] border border-white/10 focus-within:border-purple-550 rounded-lg px-3 py-0.5 transition-colors">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Elena Rostova"
                  value={nameForm}
                  onChange={(e) => setNameForm(e.target.value)}
                  className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 font-mono text-xs py-2 px-2.5"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Work Email address</label>
            <div className="flex items-center bg-[#151928] border border-white/10 focus-within:border-purple-550 rounded-lg px-3 py-0.5 transition-colors">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <input 
                type="email" 
                required
                placeholder="sre@domain.com"
                value={emailForm}
                onChange={(e) => setEmailForm(e.target.value)}
                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 font-mono text-xs py-2 px-2.5"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Workspace Team Domain</label>
            <div className="flex items-center bg-[#151928] border border-white/10 focus-within:border-purple-550 rounded-lg px-3 py-0.5 transition-colors">
              <Compass className="w-4 h-4 text-slate-500 shrink-0" />
              <input 
                type="text" 
                required
                placeholder="e.g. NexaCorp"
                value={companyForm}
                onChange={(e) => setCompanyForm(e.target.value)}
                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 font-mono text-xs py-2 px-2.5"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Enterprise Password</label>
            <div className="flex items-center bg-[#151928] border border-white/10 focus-within:border-purple-550 rounded-lg px-3 py-0.5 transition-colors">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={passwordForm}
                onChange={(e) => setPasswordForm(e.target.value)}
                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-slate-600 font-mono text-xs py-2 px-2.5"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:brightness-95 text-white font-mono text-xs font-bold shadow-lg shadow-purple-500/10 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSignUp ? "Create Workspace account" : "Authorize workspace Access"}
          </button>
        </form>

        {/* Horizontal separator */}
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-600 space-x-2">
          <div className="h-0 border-b border-white/5 flex-grow"></div>
          <span>Or configure SSO single-sign-on</span>
          <div className="h-0 border-b border-white/5 flex-grow"></div>
        </div>

        {/* OAuth buttons mock endpoints triggers */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              setUserEmail("okta-sso@company-security.okta");
              setUserFullName("Okta User");
              setUserCompany("OktaFed");
              setIsLoggedIn(true);
            }}
            className="py-2 px-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors font-mono text-[10px] flex items-center justify-center gap-1 text-slate-300 cursor-pointer active:scale-[0.98]"
          >
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            Okta Enterprise
          </button>
          
          <button 
            onClick={() => {
              setUserEmail("github-sso@company-security.github");
              setUserFullName("Git SRE Operator");
              setUserCompany("GithubHQ");
              setIsLoggedIn(true);
            }}
            className="py-2 px-1 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors font-mono text-[10px] flex items-center justify-center gap-1 text-slate-300 cursor-pointer active:scale-[0.98]"
          >
            <Terminal className="w-3 h-3 text-purple-400" />
            Github SSO
          </button>
        </div>

        {/* Dynamic toggle */}
        <div className="text-center font-mono text-[11px] pt-1">
          <span className="text-slate-500">
            {isSignUp ? "Already registered workspace domain? " : "Require custom team domain? "}
          </span>
          <button 
            onClick={toggleMode}
            className="text-purple-300 hover:text-purple-400 underline font-semibold cursor-pointer ml-1"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};
