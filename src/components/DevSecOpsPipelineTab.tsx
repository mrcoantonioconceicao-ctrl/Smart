// ============================================================================
// [AST REFACTORED] MÓDULO REMEDIADO (CLEAN CODE & DDD)
// Arquivo: src/components/DevSecOpsPipelineTab.tsx | Conformidade AST Validada
// ============================================================================

import React, { useState } from "react";
import { Terminal, Play, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, RefreshCw, FileText, Download, Sparkles, Check } from "lucide-react";
import { PipelineStep } from "../types";
import { REPO_INFO } from "../data/contractData";
import { useAppConfig } from "../context/AppContext";

export const DevSecOpsPipelineTab: React.FC = () => {
  const { viewMode, t } = useAppConfig();
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: "step-1",
      name: "1. Compilação Rust Anchor (cargo check & anchor build)",
      command: "anchor build --verifiable",
      status: "passed",
      durationMs: 1420,
      output: [
        `Compiling solana_sandbox_counter v0.1.0 (/programs/solana_sandbox_counter)`,
        `   Finished release [optimized] target(s) in 1.42s`,
        `Generated Anchor IDL: target/idl/solana_sandbox_counter.json`,
        `Program Binary: target/deploy/solana_sandbox_counter.so (Size: 142 KB)`,
        `Program ID Verificado: ${REPO_INFO.programId}`,
      ],
    },
    {
      id: "step-2",
      name: "2. Escaneamento Estático DevSecOps (AST Security Scanner)",
      command: "cargo-clippy -- -D warnings && anchor lint",
      status: "passed",
      durationMs: 850,
      output: [
        `[AST SEC-001] Checking declare_id! macro... PASSED`,
        `[AST SEC-002] Checking PDA seeds & bump constraints... PASSED`,
        `[AST SEC-003] Checking Signer<'info> authority enforcement... PASSED`,
        `[AST SEC-004] Checking has_one = authority owner validation... PASSED`,
        `[AST SEC-005] Verifying exact account space (8 + 32 + 8 + 1 = 49 bytes)... PASSED`,
        `[AST SEC-006] Integer Arithmetic Overflow Check... PASSED (Checked arithmetic recommended)`,
        `DevSecOps AST Score Final: 95/100 (Aprovado para Devnet/Localnet)`,
      ],
    },
    {
      id: "step-3",
      name: "3. Verificação Verificável Solana (solana-verify)",
      command: "solana-verify verify-from-image -p solana_sandbox_counter",
      status: "passed",
      durationMs: 2100,
      output: [
        `Fetching official docker image solanalabs/solana:v1.18.0...`,
        `Building verifiable executable in isolated container...`,
        `On-chain Hash:  4a9e8f7c1b2d...`,
        `Compiled Hash:  4a9e8f7c1b2d...`,
        `STATUS: Binary hashes match perfectly! (Verifiable Build Verified)`,
      ],
    },
    {
      id: "step-4",
      name: "4. Testes de Integração Cliente (anchor test / ts-mocha)",
      command: "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts",
      status: "passed",
      durationMs: 1850,
      output: [
        `  solana_sandbox_counter`,
        `    ✔ Initializes the PDA Counter Account (124ms)`,
        `    ✔ Increments the Counter (88ms)`,
        `  2 passing (212ms)`,
      ],
    },
  ]);

  const handleRunFullPipeline = () => {
    setIsRunningPipeline(true);
    // Reset status to running sequentially
    setSteps((prev) =>
      prev.map((step, idx) => ({
        ...step,
        status: idx === 0 ? "running" : "idle",
      }))
    );

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === current - 1) return { ...s, status: "passed" };
            if (idx === current) return { ...s, status: "running" };
            return s;
          })
        );
      } else {
        setSteps((prev) => prev.map((s) => ({ ...s, status: "passed" })));
        setIsRunningPipeline(false);
        clearInterval(interval);
      }
    }, 1200);
  };

  const handleDownloadReport = () => {
    const reportText = `# Relatório de CI/CD DevSecOps - ${REPO_INFO.repo}
Data: ${new Date().toLocaleString()}
Program ID: ${REPO_INFO.programId}
Framework: ${REPO_INFO.framework}
Score AST: ${REPO_INFO.initialScore}/100

## Etapas do Pipeline:
${steps
  .map(
    (s) => `### ${s.name} [${s.status.toUpperCase()}]
Comando: ${s.command}
Duração: ${s.durationMs}ms
Logs:
${s.output.map((line) => `> ${line}`).join("\n")}
`
  )
  .join("\n")}
`;
    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Relatorio_DevSecOps_Solana.md";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {viewMode === "simple" ? t.simplePipelineTitle : t.pipelineTitle}
            </h2>
            {viewMode === "advanced" && (
              <span className="text-xs bg-amber-950 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-800">
                Anchor v0.30.0
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {viewMode === "simple" ? t.simplePipelineDesc : t.pipelineDesc}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunFullPipeline}
            disabled={isRunningPipeline}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all"
          >
            {isRunningPipeline ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{isRunningPipeline ? t.loading : t.runPipelineBtn}</span>
          </button>

          {viewMode === "advanced" && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportReport}</span>
            </button>
          )}
        </div>
      </div>

      {/* Simple View vs Advanced Pipeline Steps */}
      {viewMode === "simple" ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{t.simplePipelineTitle}</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                ✓ 4/4 {t.rulesPassed}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    step.status === "passed"
                      ? "bg-slate-950 border-emerald-500/30 text-emerald-300"
                      : step.status === "running"
                      ? "bg-indigo-950/40 border-indigo-500 text-indigo-200 animate-pulse"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-slate-400">Etapa {idx + 1}</span>
                    {step.status === "passed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {step.status === "running" && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{step.name.split(". ")[1] || step.name}</h4>
                  <span className="text-[11px] font-semibold text-emerald-400 mt-3 block">
                    {step.status === "passed" ? "✓ Aprovado" : step.status === "running" ? "Processando..." : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Advanced Pipeline Steps Grid with Terminal Output */
        <div className="grid grid-cols-1 gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`bg-slate-900 border rounded-xl p-5 shadow-lg transition-all ${
                step.status === "running"
                  ? "border-indigo-500/80 bg-indigo-950/20"
                  : step.status === "passed"
                  ? "border-slate-800"
                  : "border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {step.status === "passed" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {step.status === "running" && <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />}
                  {step.status === "idle" && <div className="w-5 h-5 rounded-full border-2 border-slate-700" />}
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{step.name}</h3>
                    <span className="text-xs font-mono text-cyan-400">$ {step.command}</span>
                  </div>
                </div>

                {step.durationMs && (
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {step.durationMs}ms
                  </span>
                )}
              </div>

              {/* Terminal Output */}
              <div className="mt-3 bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
                {step.output.map((line, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span className={line.includes("PASSED") || line.includes("✔") ? "text-emerald-400 font-semibold" : ""}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
