import React, { useState } from "react";
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, Info, Lock, ChevronRight, Calculator, FileCheck, Layers, Sparkles, Bug, Wand2, ArrowRight } from "lucide-react";
import { SecurityFinding, AccountSpaceCalculation, AstNode, AuditSeverity } from "../types";
import { useAppConfig } from "../context/AppContext";

interface SecurityAuditTabProps {
  score: number;
  findings: SecurityFinding[];
  spaceCalc: AccountSpaceCalculation;
  astNodes: AstNode[];
  onOpenAiModal: () => void;
  onOpenFuzzingModal?: () => void;
}

export const SecurityAuditTab: React.FC<SecurityAuditTabProps> = ({
  score,
  findings,
  spaceCalc,
  astNodes,
  onOpenAiModal,
  onOpenFuzzingModal,
}) => {
  const { viewMode, t } = useAppConfig();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedAstNode, setExpandedAstNode] = useState<string | null>(astNodes[0]?.name || null);

  const passedCount = findings.filter((f) => f.isPassed).length;
  const criticalCount = findings.filter((f) => f.severity === "CRITICAL" && !f.isPassed).length;
  const highCount = findings.filter((f) => f.severity === "HIGH" && !f.isPassed).length;
  const mediumCount = findings.filter((f) => f.severity === "MEDIUM" && !f.isPassed).length;

  const filteredFindings = selectedCategory === "ALL"
    ? findings
    : findings.filter((f) => f.category === selectedCategory);

  const getSeverityBadge = (severity: AuditSeverity, isPassed: boolean) => {
    if (isPassed) {
      return (
        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>APROVADO (PASS)</span>
        </span>
      );
    }
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800/60 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRÍTICO</span>
          </span>
        );
      case "HIGH":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800/60">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ALTO RISCO</span>
          </span>
        );
      case "MEDIUM":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-950 text-yellow-400 border border-yellow-800/60">
            <Info className="w-3.5 h-3.5" />
            <span>MÉDIO</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            <Info className="w-3.5 h-3.5" />
            <span>INFORMATIVO</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple View Banner vs Advanced Header */}
      {viewMode === "simple" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl border ${
                score >= 80 
                  ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-400" 
                  : "bg-rose-950/80 border-rose-500/40 text-rose-400"
              }`}>
                {score >= 80 ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-100">
                  {score >= 80 ? t.simpleSecuritySafeTitle : t.simpleSecurityWarningTitle}
                </h3>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {score >= 80 ? t.simpleSecuritySafeDesc : t.simpleSecurityWarningDesc}
                </p>
                <div className="mt-3 flex items-center space-x-3 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ✓ {passedCount}/{findings.length} {t.rulesPassed}
                  </span>
                  {criticalCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                      🚨 {criticalCount} {t.criticalAlerts}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={onOpenAiModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{t.simpleActionAutoFix}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Advanced DevSecOps Dashboard Header */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex items-center justify-between col-span-1 md:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">{t.auditHeaderTitle}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {t.auditHeaderDesc}
              </p>
              <div className="mt-3 flex items-center space-x-4 text-xs font-medium">
                <span className="text-emerald-400 font-mono">✓ {passedCount}/{findings.length} {t.rulesPassed}</span>
                {criticalCount > 0 && <span className="text-rose-400 font-mono">🚨 {criticalCount} {t.criticalAlerts}</span>}
                {mediumCount > 0 && <span className="text-amber-400 font-mono">⚠️ {mediumCount} {t.warningAlerts}</span>}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 min-w-[100px] shadow-inner">
              <span className="text-3xl font-black font-mono text-emerald-400">{score}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">de 100</span>
            </div>
          </div>

          {/* Account Space Quick Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.accountSpaceTitle}</span>
              <Calculator className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold font-mono text-cyan-400">{spaceCalc.totalBytes} Bytes</div>
              <p className="text-xs text-slate-400 mt-0.5">{t.spaceDetail}</p>
            </div>
            <div className="text-[11px] text-slate-300 mt-2 font-mono bg-slate-950 p-2 rounded border border-slate-800">
              {t.minRentReserve}: ~{spaceCalc.rentLamportsEstimate} SOL
            </div>
          </div>

          {/* AI & Fuzzing Action Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 border border-indigo-800/50 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <h4 className="text-sm font-bold text-slate-100">{t.deepAuditTitle}</h4>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t.deepAuditDesc}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={onOpenAiModal}
                className="py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-900/40 text-center"
              >
                {t.execAiAudit}
              </button>
              {onOpenFuzzingModal && (
                <button
                  onClick={onOpenFuzzingModal}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-950 border border-rose-500/50 hover:border-rose-400 text-rose-300 text-xs font-semibold transition-all shadow-md flex items-center justify-center space-x-1"
                >
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  <span>Fuzzing Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold px-2">Categorias AST:</span>
        {["ALL", "Access Control", "PDA Validation", "Arithmetic Safety", "Account Space", "CPI Security"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {cat === "ALL" ? "Todas as Regras" : cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Security Findings & AST Tree Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Itemized Rules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <span>Resultados da Análise de Regras AST ({filteredFindings.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-lg transition-all ${
                  finding.isPassed
                    ? "border-slate-800/80 hover:border-slate-700"
                    : "border-amber-500/40 bg-amber-950/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {finding.isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-sm text-slate-100">{finding.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {finding.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300">
                          {finding.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{finding.description}</p>
                    </div>
                  </div>

                  <div>{getSeverityBadge(finding.severity, finding.isPassed)}</div>
                </div>

                {/* Code snippets & recommendations */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  {finding.codeSnippet && (
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                      <span className="text-slate-400 block mb-1">Padrão Verificado no Contrato:</span>
                      <code className="text-cyan-300">{finding.codeSnippet}</code>
                    </div>
                  )}

                  {finding.fixedSnippet && !finding.isPassed && (
                    <div className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/50 font-mono text-[11px]">
                      <span className="text-emerald-400 block mb-1">Recomendação de Correção DevSecOps:</span>
                      <code className="text-emerald-300">{finding.fixedSnippet}</code>
                    </div>
                  )}

                  <div className="flex items-start space-x-2 text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-300">Diretriz de Segurança:</strong> {finding.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: AST Representation & Account Layout */}
        <div className="space-y-6">
          {/* Account Memory Layout Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Layout de Memória On-Chain (UserCounter)</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-indigo-800/40 flex justify-between items-center">
                <span className="text-indigo-400 font-semibold">Discriminator Anchor</span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded">8 bytes</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-cyan-800/40 flex justify-between items-center">
                <span className="text-cyan-400 font-semibold">authority (Pubkey)</span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded">32 bytes</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-emerald-800/40 flex justify-between items-center">
                <span className="text-emerald-400 font-semibold">count (u64)</span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded">8 bytes</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-amber-800/40 flex justify-between items-center">
                <span className="text-amber-400 font-semibold">bump (u8)</span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded">1 byte</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center font-mono">
              <span>Soma Total do Buffer:</span>
              <span className="text-slate-100 font-bold">49 bytes</span>
            </div>
          </div>

          {/* AST Tree Node Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 mb-3">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Árvore Sintática AST Parsed</span>
            </h3>

            <div className="space-y-2 text-xs">
              {astNodes.map((node) => (
                <div
                  key={node.name}
                  className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedAstNode(expandedAstNode === node.name ? null : node.name)}
                    className="w-full text-left p-3 flex items-center justify-between font-mono font-semibold text-slate-200 hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          expandedAstNode === node.name ? "rotate-90 text-indigo-400" : ""
                        }`}
                      />
                      <span>{node.name}</span>
                    </span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">
                      {node.type}
                    </span>
                  </button>

                  {expandedAstNode === node.name && (
                    <div className="px-4 pb-3 pt-1 border-t border-slate-900 space-y-2 text-slate-300 text-xs">
                      <p className="text-slate-400">{node.details}</p>
                      {node.securityNote && (
                        <div className="bg-emerald-950/30 p-2 rounded border border-emerald-800/40 text-[11px] text-emerald-300">
                          🛡️ {node.securityNote}
                        </div>
                      )}

                      {node.children && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-500/40 space-y-2">
                          {node.children.map((child) => (
                            <div key={child.name} className="space-y-1">
                              <span className="font-mono font-semibold text-cyan-300 block">
                                └─ {child.name}
                              </span>
                              <p className="text-[11px] text-slate-400">{child.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
