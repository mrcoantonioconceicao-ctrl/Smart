import React from "react";
import { Shield, Code2, Cpu, Terminal, Sparkles, ExternalLink, Activity } from "lucide-react";
import { ActiveTab } from "../types";
import { REPO_INFO } from "../data/contractData";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  securityScore: number;
  cluster: string;
  setCluster: (cluster: string) => void;
  onOpenAiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  securityScore,
  cluster,
  setCluster,
  onOpenAiModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Repository Badge */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
                  Solana Anchor DevSecOps
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  AST Security Auditor
                </span>
              </div>
              <a
                href={REPO_INFO.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1"
              >
                <span>{REPO_INFO.owner}/{REPO_INFO.repo}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Contrato Anchor (Rust)</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "audit"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Auditoria DevSecOps AST</span>
            </button>

            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "simulator"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Simulador dApp Solana</span>
            </button>

            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "pipeline"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Pipeline CI/CD DevSecOps</span>
            </button>
          </nav>

          {/* Controls Right */}
          <div className="flex items-center space-x-3">
            {/* Cluster Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <select
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                className="bg-transparent text-slate-300 font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value="Localnet" className="bg-slate-900">Solana Localnet</option>
                <option value="Devnet" className="bg-slate-900">Solana Devnet</option>
                <option value="Mainnet-Beta" className="bg-slate-900">Solana Mainnet</option>
              </select>
            </div>

            {/* Score Badge */}
            <div
              onClick={() => setActiveTab("audit")}
              className="cursor-pointer flex items-center space-x-2 bg-slate-950 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-semibold hover:border-emerald-400 transition-colors"
            >
              <span className="text-slate-400">Score AST:</span>
              <span className="text-emerald-400 font-mono font-bold">{securityScore}/100</span>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auditor Gemini AI</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "editor" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Contrato (Rust)
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "audit" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Auditoria DevSecOps
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "simulator" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Simulador dApp
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "pipeline" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Pipeline CI/CD
          </button>
        </div>
      </div>
    </header>
  );
};
