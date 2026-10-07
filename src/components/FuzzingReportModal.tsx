import React, { useState, useMemo } from "react";
import {
  X,
  Bug,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Copy,
  Check,
  FileText,
  Search,
  Terminal,
  Play,
  Flame,
  ArrowRight,
  Database,
  Filter,
  Info,
} from "lucide-react";
import {
  PropertyFuzzer,
  FuzzerSuiteReport,
  BoundaryClass,
  AccountAnomalyType,
  NumericalType,
  FuzzNumericalInput,
  FuzzAccountInput,
  InvariantEvaluation,
} from "../utils/fuzzer";

export interface FuzzingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rustCode: string;
}

export const FuzzingReportModal: React.FC<FuzzingReportModalProps> = ({
  isOpen,
  onClose,
  rustCode,
}) => {
  const [iterations, setIterations] = useState<number>(10000);
  const [customSeed, setCustomSeed] = useState<number>(0xdeadbeef);
  const [activeTab, setActiveTab] = useState<
    "summary" | "vulnerabilities" | "numbers" | "accounts" | "vectors"
  >("summary");
  const [isFuzzingRunning, setIsFuzzingRunning] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNumType, setSelectedNumType] = useState<string>("ALL");
  const [selectedAnomalyFilter, setSelectedAnomalyFilter] = useState<string>("ALL");

  // Run property-based fuzzer on rustCode with configured iterations & seed
  const [report, setReport] = useState<FuzzerSuiteReport>(() => {
    const fuzzer = new PropertyFuzzer(0xdeadbeef);
    return fuzzer.fuzzContract(rustCode, 10000);
  });

  // Re-run fuzzing when requested or when modal opens with new code
  const handleRunFuzzing = (newIterations: number = iterations, seedToUse: number = customSeed) => {
    setIsFuzzingRunning(true);
    setTimeout(() => {
      const fuzzer = new PropertyFuzzer(seedToUse);
      const newReport = fuzzer.fuzzContract(rustCode, newIterations);
      setReport(newReport);
      setIsFuzzingRunning(false);
    }, 400);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const violations = useMemo(() => {
    return report.invariants.filter((i) => i.status === "VIOLATED");
  }, [report]);

  const passedInvariants = useMemo(() => {
    return report.invariants.filter((i) => i.status === "PASSED");
  }, [report]);

  // Filter numerical inputs
  const filteredNumbers = useMemo(() => {
    return report.extremeInputsCatalog.numbers.filter((num) => {
      const matchesType = selectedNumType === "ALL" || num.type === selectedNumType;
      const matchesSearch =
        num.paramName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        num.boundaryClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
        num.rawValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        num.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [report, selectedNumType, searchQuery]);

  // Filter account inputs
  const filteredAccounts = useMemo(() => {
    return report.extremeInputsCatalog.accounts.filter((acc) => {
      const matchesAnomaly =
        selectedAnomalyFilter === "ALL" ||
        (selectedAnomalyFilter === "MALICIOUS" && acc.isMaliciousOrExtreme) ||
        (selectedAnomalyFilter === "VALID" && !acc.isMaliciousOrExtreme) ||
        acc.anomalyType === selectedAnomalyFilter;

      const matchesSearch =
        acc.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.pubkey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.anomalyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesAnomaly && matchesSearch;
    });
  }, [report, selectedAnomalyFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Bug className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100 tracking-tight">
                  Relatório de Fuzzing &amp; Testes Baseados em Propriedades
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-rose-950 text-rose-300 border border-rose-800/80">
                  src/utils/fuzzer.ts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mutações extremas de parâmetros numéricos, ataques de accounts e oráculo de invariantes Anchor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => handleRunFuzzing()}
              disabled={isFuzzingRunning}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              {isFuzzingRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Fuzzing em Execução...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Re-executar Fuzzer</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Fechar Relatório"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fuzzing Toolbar & Parameters Bar */}
        <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Iterações:</span>
              <select
                value={iterations}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIterations(val);
                  handleRunFuzzing(val, customSeed);
                }}
                className="bg-slate-950 text-indigo-300 font-mono font-semibold rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-800"
              >
                <option value={1000}>1.000 iterações</option>
                <option value={5000}>5.000 iterações</option>
                <option value={10000}>10.000 iterações</option>
                <option value={50000}>50.000 iterações</option>
                <option value={100000}>100.000 iterações</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium">Semente (PRNG):</span>
              <input
                type="text"
                value={`0x${customSeed.toString(16)}`}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value.replace("0x", ""), 16);
                  if (!isNaN(parsed)) {
                    setCustomSeed(parsed);
                  }
                }}
                className="bg-slate-950 text-amber-300 font-mono font-semibold rounded px-1.5 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-amber-500 border border-slate-800"
              />
            </div>

            <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
              <span>Tempo: <strong className="text-slate-200">{report.executionTimeMs}ms</strong></span>
              <span>•</span>
              <span>Invariantes: <strong className="text-slate-200">{report.invariants.length}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {report.violationsCount === 0 ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>0 VIOLAÇÕES (PASSED)</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{report.violationsCount} VIOLAÇÃO(ÕES) DETECTADA(S)</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="bg-slate-950 px-5 pt-2 border-b border-slate-800 flex overflow-x-auto space-x-1 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === "summary"
                ? "border-indigo-500 text-indigo-400 bg-indigo-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Visão Geral &amp; Invariantes ({report.invariants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("vulnerabilities")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === "vulnerabilities"
                ? "border-rose-500 text-rose-400 bg-rose-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>
              Falhas &amp; Trace Repro ({report.violationsCount})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("numbers")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === "numbers"
                ? "border-amber-500 text-amber-400 bg-amber-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Entradas Numéricas ({report.extremeInputsCatalog.numbers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === "accounts"
                ? "border-cyan-500 text-cyan-400 bg-cyan-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Anomalias de Accounts ({report.extremeInputsCatalog.accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("vectors")}
            className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 font-medium transition-all whitespace-nowrap ${
              activeTab === "vectors"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vetores de Ataque &amp; Casos ({report.generatedEdgeVectors.length})</span>
          </button>
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: SUMMARY & INVARIANTS */}
          {activeTab === "summary" && (
            <div className="space-y-5">
              {/* Executive Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  report.violationsCount === 0
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-200"
                    : "bg-rose-950/40 border-rose-800/60 text-rose-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {report.violationsCount === 0 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm">
                      {report.violationsCount === 0
                        ? "Contrato Aprovado com Sucesso pelo Fuzzer de Propriedades"
                        : "Atenção: Violações de Invariantes Encontradas durante o Fuzzing"}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{report.summary}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center font-mono text-[11px]">
                  <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                    PRNG Seed: 0x{customSeed.toString(16)}
                  </span>
                </div>
              </div>

              {/* Statistics Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Iterações Testadas
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-100">
                    {report.totalIterations.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Invariantes Aprovadas
                  </span>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {passedInvariants.length} / {report.invariants.length}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Violações Detectadas
                  </span>
                  <div
                    className={`text-lg font-bold font-mono ${
                      report.violationsCount === 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {report.violationsCount}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Tempo de Execução
                  </span>
                  <div className="text-lg font-bold font-mono text-cyan-400">
                    {report.executionTimeMs} ms
                  </div>
                </div>
              </div>

              {/* Invariants Evaluation Table / Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Oráculo de Invariantes de Segurança (Property Verification)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Total: {report.invariants.length} regras formais
                  </span>
                </div>

                <div className="space-y-2.5">
                  {report.invariants.map((inv) => (
                    <div
                      key={inv.id}
                      className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                        inv.status === "PASSED"
                          ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                          : "bg-rose-950/30 border-rose-900/60 shadow-lg shadow-rose-950/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${
                              inv.status === "PASSED"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "bg-rose-950 text-rose-300 border border-rose-800"
                            }`}
                          >
                            {inv.id}
                          </span>
                          <span className="font-bold text-slate-100 text-xs">{inv.title}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                            {inv.category}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                              inv.status === "PASSED"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
                                : "bg-rose-950 text-rose-300 border border-rose-800/80"
                            }`}
                          >
                            {inv.status === "PASSED" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>PASSED</span>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" />
                                <span>VIOLATED</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-300 leading-snug">{inv.description}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                        <span>Iterações Avaliadas: {inv.iterationsEvaluated.toLocaleString()}</span>
                        {inv.failingInputSample && (
                          <button
                            onClick={() => setActiveTab("vulnerabilities")}
                            className="text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1 underline"
                          >
                            <span>Ver Amostra de Falha &amp; Trace</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VULNERABILITIES & SHRINK TRACES */}
          {activeTab === "vulnerabilities" && (
            <div className="space-y-4">
              {violations.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">Nenhuma Vulnerabilidade Detectada</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    O fuzzer executou {report.totalIterations.toLocaleString()} iterações com mutações de limites extremas e não encontrou violações no contrato fornecido.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-rose-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Falhas Detectadas e Traço de Minimização (Shrink Repro)</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {violations.length} invariante(s) violada(s)
                    </span>
                  </div>

                  {violations.map((v) => (
                    <div
                      key={v.id}
                      className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 space-y-3 shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-950 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 rounded">
                            {v.id}
                          </span>
                          <span className="font-bold text-slate-100 text-sm">{v.title}</span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-900 text-rose-400 border border-rose-900 rounded self-start sm:self-auto">
                          {v.category}
                        </span>
                      </div>

                      <p className="text-slate-300 text-xs">{v.description}</p>

                      {v.failingInputSample && (
                        <div className="space-y-3 pt-2">
                          {/* Error Code block */}
                          <div className="bg-slate-900/90 p-3 rounded-lg border border-rose-950 font-mono text-[11px] space-y-1.5">
                            <div className="text-rose-400 font-bold flex items-center justify-between">
                              <span>Instrução Afetada: {v.failingInputSample.instruction}</span>
                              <span className="text-[10px] text-slate-400">Simulação BPF VM</span>
                            </div>
                            <div className="text-rose-300 bg-slate-950 p-2 rounded border border-rose-900/40">
                              {v.failingInputSample.reproducedError}
                            </div>
                          </div>

                          {/* Shrink Trace Steps */}
                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
                            <div className="text-slate-300 font-semibold text-[11px] flex items-center space-x-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Passos de Minimização para Reprodução Mínima (Shrink Trace):</span>
                            </div>
                            <div className="space-y-1 pl-2">
                              {v.failingInputSample.shrinkTrace.map((step, idx) => (
                                <div key={idx} className="flex items-start space-x-2 text-[11px] font-mono text-slate-300">
                                  <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Failing Payload parameters & accounts */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                              <div className="text-slate-400 font-sans font-bold text-[10px] uppercase mb-1">
                                Parâmetros Falhos:
                              </div>
                              <pre className="text-amber-300 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(v.failingInputSample.params, null, 2)}
                              </pre>
                            </div>

                            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                              <div className="text-slate-400 font-sans font-bold text-[10px] uppercase mb-1">
                                Estado das Contas Falhas:
                              </div>
                              <pre className="text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(v.failingInputSample.accounts, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXTREME NUMERICAL INPUTS */}
          {activeTab === "numbers" && (
            <div className="space-y-4">
              {/* Search & Type Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar tipo, nome, limite..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
                  <span className="text-slate-400 font-semibold text-[11px] mr-1">Tipo:</span>
                  {["ALL", "u64", "u32", "u8"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedNumType(type)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                        selectedNumType === type
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Extreme Numerical Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {num.paramName}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-800">
                          {num.type}
                        </span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-mono rounded font-semibold ${
                          num.boundaryClass === "OVERFLOW_BOUNDARY" || num.boundaryClass === "MAX"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-slate-900 text-slate-300 border border-slate-800"
                        }`}
                      >
                        {num.boundaryClass}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-200">
                      <span className="truncate pr-2">{num.rawValue}</span>
                      <button
                        onClick={() => copyToClipboard(num.rawValue, `num-${idx}`)}
                        className="text-slate-400 hover:text-slate-200 shrink-0"
                        title="Copiar Valor"
                      >
                        {copiedKey === `num-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight">
                      {num.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXTREME ACCOUNT ANOMALIES */}
          {activeTab === "accounts" && (
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar account, anomalia, pubkey..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
                  <span className="text-slate-400 font-semibold mr-1">Anomalia:</span>
                  {[
                    { id: "ALL", label: "Todas" },
                    { id: "MALICIOUS", label: "Apenas Extremas/Maliciosas" },
                    { id: "VALID", label: "Conformes" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedAnomalyFilter(filter.id)}
                      className={`px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                        selectedAnomalyFilter === filter.id
                          ? "bg-cyan-500 text-slate-950 font-bold"
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Extreme Account Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                      acc.isMaliciousOrExtreme
                        ? "bg-slate-950/90 border-rose-900/40 hover:border-rose-800"
                        : "bg-slate-950/50 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-cyan-300 text-xs">
                          {acc.accountName}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-mono rounded font-semibold ${
                            acc.isMaliciousOrExtreme
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          {acc.anomalyType}
                        </span>
                      </div>

                      {acc.isMaliciousOrExtreme && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          EXTREMO
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800">
                      <div>
                        Lamports: <span className="text-slate-200">{acc.lamports}</span>
                      </div>
                      <div>
                        Signer:{" "}
                        <span className={acc.isSigner ? "text-emerald-400" : "text-rose-400 font-bold"}>
                          {acc.isSigner ? "true" : "false"}
                        </span>
                      </div>
                      <div>
                        Writable:{" "}
                        <span className={acc.isWritable ? "text-emerald-400" : "text-amber-400"}>
                          {acc.isWritable ? "true" : "false"}
                        </span>
                      </div>
                      <div>
                        Bump Seed: <span className="text-slate-200">{acc.bumpSeed}</span>
                      </div>
                      <div>
                        Data Length: <span className="text-slate-200">{acc.dataBytesLength} bytes</span>
                      </div>
                      <div className="col-span-2 truncate">
                        Owner: <span className="text-indigo-300">{acc.owner}</span>
                      </div>
                      <div className="col-span-2 truncate">
                        Pubkey: <span className="text-slate-300">{acc.pubkey}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {acc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GENERATED ATTACK VECTORS */}
          {activeTab === "vectors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Catálogo de Vetores de Ataque Gerados pelo Fuzzer</span>
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(report, null, 2),
                      "full-report-json"
                    )
                  }
                  className="flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-200 font-mono transition-colors"
                >
                  {copiedKey === "full-report-json" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Relatório Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Exportar JSON Completo</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Vetores de Ataque em Fronteira Testados nesta Execução:
                </div>

                <div className="space-y-2">
                  {report.generatedEdgeVectors.map((vec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 font-mono"
                    >
                      <span className="text-emerald-400 font-bold shrink-0">#{idx + 1}</span>
                      <span>{vec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Motor: PropertyFuzzer (PRNG Semeável + Solana Anchor Spec)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
