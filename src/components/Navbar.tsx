import React from "react";
import {
  Shield,
  Code2,
  Cpu,
  Terminal,
  Sparkles,
  ExternalLink,
  Github,
  Workflow,
  Bug,
  Globe,
  Wand2,
  Sliders,
} from "lucide-react";
import { ActiveTab, GitHubUser } from "../types";
import { REPO_INFO } from "../data/contractData";
import { useAppConfig } from "../context/AppContext";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  securityScore: number;
  cluster: string;
  setCluster: (cluster: string) => void;
  onOpenAiModal: () => void;
  githubUser: GitHubUser | null;
  onOpenGitHubModal: () => void;
  onOpenBpmnModal: () => void;
  onOpenFuzzingModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  securityScore,
  cluster,
  setCluster,
  onOpenAiModal,
  githubUser,
  onOpenGitHubModal,
  onOpenBpmnModal,
  onOpenFuzzingModal,
}) => {
  const { language, setLanguage, viewMode, setViewMode, t } = useAppConfig();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mode Badges */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="hidden xl:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  {t.subTitle}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <a
                  href={REPO_INFO.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>{REPO_INFO.owner}/{REPO_INFO.repo}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "editor"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{viewMode === "simple" ? t.tabEditor : t.tabEditorAdv}</span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "audit"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{viewMode === "simple" ? t.tabAudit : t.tabAuditAdv}</span>
            </button>

            <button
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "simulator"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{viewMode === "simple" ? t.tabSimulator : t.tabSimulatorAdv}</span>
            </button>

            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "pipeline"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>{viewMode === "simple" ? t.tabPipeline : t.tabPipelineAdv}</span>
            </button>
          </nav>

          {/* Controls Right (Mode Switcher, i18n, Modals) */}
          <div className="flex items-center space-x-2">
            {/* View Mode Switcher (Simple / Assistido vs Advanced / Engenheiro) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode("simple")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "simple"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Ativar Modo Assistido (Interface Simplificada para Leigos)"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{language === "pt" ? "Leigo" : "Assisted"}</span>
              </button>
              <button
                onClick={() => setViewMode("advanced")}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "advanced"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Ativar Modo Engenheiro (Interface com Detalhes Técnicos de AST/BPMN)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{language === "pt" ? "Avançado" : "Advanced"}</span>
              </button>
            </div>

            {/* Language Selector (PT-BR / EN-US) */}
            <div className="flex items-center bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <button
                onClick={() => setLanguage("pt")}
                className={`px-1.5 py-0.5 rounded ${
                  language === "pt" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                PT
              </button>
              <span className="text-slate-700 mx-0.5">|</span>
              <button
                onClick={() => setLanguage("en")}
                className={`px-1.5 py-0.5 rounded ${
                  language === "en" ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                EN
              </button>
            </div>

            {/* Advanced Modals (Only in Advanced Mode or Compact in Simple) */}
            {viewMode === "advanced" && (
              <>
                <button
                  onClick={onOpenFuzzingModal}
                  className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-rose-500/40 hover:border-rose-400 text-rose-300 text-xs font-semibold transition-all"
                  title="Fuzzing Report"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>Fuzzing</span>
                </button>

                <button
                  onClick={onOpenBpmnModal}
                  className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 text-xs font-semibold transition-all"
                  title="Testes & BPMN 2.0"
                >
                  <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                  <span>BPMN</span>
                </button>
              </>
            )}

            {/* GitHub Sync Button */}
            <button
              onClick={onOpenGitHubModal}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                githubUser
                  ? "bg-slate-950 border-indigo-500/50 text-indigo-300 hover:border-indigo-400"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
              }`}
              title={githubUser ? `@${githubUser.login}` : t.githubFork}
            >
              {githubUser ? (
                <>
                  <img
                    src={githubUser.avatar_url}
                    alt={githubUser.login}
                    className="w-4 h-4 rounded-full border border-indigo-400"
                  />
                  <span className="font-mono hidden sm:inline">@{githubUser.login}</span>
                </>
              ) : (
                <>
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span className="hidden sm:inline">GitHub</span>
                </>
              )}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.aiAuditor}</span>
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
            {viewMode === "simple" ? t.tabEditor : t.tabEditorAdv}
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "audit" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {viewMode === "simple" ? t.tabAudit : t.tabAuditAdv}
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "simulator" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {viewMode === "simple" ? t.tabSimulator : t.tabSimulatorAdv}
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === "pipeline" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {viewMode === "simple" ? t.tabPipeline : t.tabPipelineAdv}
          </button>
        </div>
      </div>
    </header>
  );
};


