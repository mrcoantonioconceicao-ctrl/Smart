import React, { useState } from "react";
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Workflow,
  Cpu,
  Boxes,
  Download,
  Server,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Flame,
  Binary,
  GitMerge,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { TestRunner, TestSuiteSummary } from "../tests/unitTests";
import { BpmnDevSecOpsWorkflowEngine } from "../services/bpmnWorkflowService";
import { SoaCatalogRegistry } from "../services/soaCatalogService";
import { runPropertyBasedFuzzing, FuzzingReport } from "../services/fuzzingEngine";
import { verifyFormalProperties, FormalVerificationReport } from "../services/formalVerificationEngine";
import { analyzeCpiDeepRisks, CpiDeepReport } from "../services/cpiDeepAnalyzerService";

interface BpmnAndTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
}

export const BpmnAndTestsModal: React.FC<BpmnAndTestsModalProps> = ({
  isOpen,
  onClose,
  currentCode,
}) => {
  const [activeTab, setActiveTab] = useState<"tests" | "fuzzing" | "formal" | "cpi" | "bpmn" | "soa" | "ddd">("tests");
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Advanced Security Engines State
  const [fuzzingReport, setFuzzingReport] = useState<FuzzingReport | null>(null);
  const [isRunningFuzzing, setIsRunningFuzzing] = useState(false);
  const [fuzzIterations, setFuzzIterations] = useState<number>(10000);

  const [formalReport, setFormalReport] = useState<FormalVerificationReport | null>(null);
  const [isRunningFormal, setIsRunningFormal] = useState(false);

  const [cpiReport, setCpiReport] = useState<CpiDeepReport | null>(null);
  const [isRunningCpi, setIsRunningCpi] = useState(false);

  const bpmnEngine = BpmnDevSecOpsWorkflowEngine.getInstance();
  const bpmnProcess = bpmnEngine.getProcessDefinition();
  const soaRegistry = SoaCatalogRegistry.getInstance();
  const soaServices = soaRegistry.getAllServices();

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const summary = TestRunner.runAllTests();
      setTestSummary(summary);
      setIsRunningTests(false);
    }, 300);
  };

  const handleRunFuzzing = () => {
    setIsRunningFuzzing(true);
    setTimeout(() => {
      const report = runPropertyBasedFuzzing(currentCode, { iterations: fuzzIterations });
      setFuzzingReport(report);
      setIsRunningFuzzing(false);
    }, 400);
  };

  const handleRunFormalVerification = () => {
    setIsRunningFormal(true);
    setTimeout(() => {
      const report = verifyFormalProperties(currentCode);
      setFormalReport(report);
      setIsRunningFormal(false);
    }, 400);
  };

  const handleRunCpiAnalysis = () => {
    setIsRunningCpi(true);
    setTimeout(() => {
      const report = analyzeCpiDeepRisks(currentCode);
      setCpiReport(report);
      setIsRunningCpi(false);
    }, 300);
  };

  const handleDownloadBpmnXml = () => {
    const xml = bpmnEngine.exportBpmn20Xml();
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devsecops_pipeline.bpmn20.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                <span>Engenharia de Software & Qualidade</span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Clean Code, DDD, SOA & BPMN
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Suíte de testes automatizados, fluxo BPMN 2.0, catálogo SOA e modelos DDD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "tests"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Testes Unitários</span>
            {testSummary && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {testSummary.passedCount}/{testSummary.totalTests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("fuzzing")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "fuzzing"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Property Fuzzing</span>
            {fuzzingReport && (
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono ${fuzzingReport.violationsCount === 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300 animate-pulse"}`}>
                {fuzzingReport.violationsCount === 0 ? "PASSED" : `${fuzzingReport.violationsCount} Violations`}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("formal")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "formal"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Métodos Formais (SMT)</span>
            {formalReport && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                {formalReport.provedTheoremsCount}/{formalReport.verificationConditions.length} Proved
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("cpi")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "cpi"
                ? "border-purple-500 text-purple-400 bg-purple-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <GitMerge className="w-4 h-4 text-purple-400" />
            <span>Análise CPI Deep</span>
            {cpiReport && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {cpiReport.totalCpiCallsDetected} Calls
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("bpmn")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "bpmn"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Workflow className="w-4 h-4 text-indigo-400" />
            <span>BPMN 2.0</span>
          </button>

          <button
            onClick={() => setActiveTab("soa")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "soa"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>Serviços SOA</span>
          </button>

          <button
            onClick={() => setActiveTab("ddd")}
            className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "ddd"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Boxes className="w-4 h-4 text-blue-400" />
            <span>DDD Domain</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: AUTOMATED TESTS */}
          {activeTab === "tests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-200">Suíte de Testes Unitários & Integração</h3>
                  <p className="text-xs text-slate-400">
                    Valida AST Auditor, GraphRAG, Simulador Solana, Servidor MCP, Domínio DDD e Motor BPMN
                  </p>
                </div>
                <button
                  onClick={handleRunTests}
                  disabled={isRunningTests}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-950/30 disabled:opacity-50"
                >
                  <Play className={`w-4 h-4 ${isRunningTests ? "animate-spin" : ""}`} />
                  <span>{isRunningTests ? "Executando Testes..." : "Executar Todos os Testes"}</span>
                </button>
              </div>

              {testSummary ? (
                <div className="space-y-6">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Total de Testes</div>
                      <div className="text-2xl font-bold text-slate-100">{testSummary.totalTests}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/50">
                      <div className="text-xs text-emerald-400">Aprovados</div>
                      <div className="text-2xl font-bold text-emerald-400">{testSummary.passedCount}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Duração</div>
                      <div className="text-2xl font-bold text-indigo-400">{testSummary.durationMs} ms</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Estimativa de Cobertura</div>
                      <div className="text-2xl font-bold text-amber-400">{testSummary.coverageEstimate}</div>
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                      <span>Caso de Teste / Suíte</span>
                      <span>Resultado</span>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                      {testSummary.results.map((res, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors">
                          <div className="flex items-start space-x-3">
                            {res.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                                {res.suite}
                              </div>
                              <div className="text-sm font-medium text-slate-200">{res.testName}</div>
                              {res.errorDetails && (
                                <div className="mt-1 text-xs text-rose-400 font-mono bg-rose-950/30 p-2 rounded border border-rose-900/40">
                                  {res.errorDetails}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{res.durationMs}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-8">
                  <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-slate-300">Nenhum teste executado nesta sessão</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Clique no botão acima para rodar a suíte completa de testes automatizados e validar todas as camadas da aplicação.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: PROPERTY-BASED FUZZING */}
          {activeTab === "fuzzing" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 gap-4">
                <div>
                  <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-rose-400" />
                    <span>Engine de Property-Based Fuzzing</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submete o contrato inteligente a até 100.000 entradas aleatórias extremas (u64::MAX, zero authority, bump seeds fora da curva)
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <select
                    value={fuzzIterations}
                    onChange={(e) => setFuzzIterations(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono"
                  >
                    <option value={1000}>1.000 Iterações</option>
                    <option value={10000}>10.000 Iterações</option>
                    <option value={50000}>50.000 Iterações</option>
                    <option value={100000}>100.000 Iterações</option>
                  </select>

                  <button
                    onClick={handleRunFuzzing}
                    disabled={isRunningFuzzing}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-xs transition-all shadow-lg shadow-rose-950/30 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Flame className={`w-4 h-4 ${isRunningFuzzing ? "animate-bounce" : ""}`} />
                    <span>{isRunningFuzzing ? "Fuzzing em Execução..." : "Iniciar Fuzzing"}</span>
                  </button>
                </div>
              </div>

              {fuzzingReport ? (
                <div className="space-y-6">
                  {/* Fuzzing Metrics Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Total de Iterações</div>
                      <div className="text-2xl font-bold font-mono text-slate-100">{fuzzingReport.totalIterations.toLocaleString()}</div>
                    </div>
                    <div className={`bg-slate-950 p-4 rounded-xl border ${fuzzingReport.violationsCount === 0 ? "border-emerald-900/50" : "border-rose-900/50"}`}>
                      <div className="text-xs text-slate-400">Violações de Invariantes</div>
                      <div className={`text-2xl font-bold font-mono ${fuzzingReport.violationsCount === 0 ? "text-emerald-400" : "text-rose-400 animate-pulse"}`}>
                        {fuzzingReport.violationsCount}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Invariantes Testadas</div>
                      <div className="text-2xl font-bold font-mono text-indigo-400">{fuzzingReport.invariantsTestedCount}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Tempo de Execução</div>
                      <div className="text-2xl font-bold font-mono text-amber-400">{fuzzingReport.executionTimeMs} ms</div>
                    </div>
                  </div>

                  {/* Summary & Extreme Cases */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="font-semibold text-indigo-300">Casos Extremos & Mutações de Borda Geradas:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono">
                      {fuzzingReport.extremeEdgeCasesTested.map((ec, idx) => (
                        <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                          <span>{ec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invariants List */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Status das Invariantes Críticas de Segurança
                    </div>

                    <div className="space-y-3">
                      {fuzzingReport.invariants.map((inv) => (
                        <div key={inv.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold text-slate-400">{inv.id}</span>
                              <span className="text-sm font-bold text-slate-200">{inv.name}</span>
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-400 font-mono">
                                {inv.category}
                              </span>
                            </div>

                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full font-mono ${inv.status === "PASSED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800 animate-pulse"}`}>
                              {inv.status === "PASSED" ? "✓ PASSED" : "🚨 VIOLATED"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400">{inv.description}</p>

                          {inv.failingInput && (
                            <div className="bg-slate-900 p-3 rounded-lg border border-rose-900/40 text-xs font-mono text-rose-300 space-y-1">
                              <div className="font-semibold text-rose-400">Payload de Entrada com Falha (Minimizado):</div>
                              <div>{JSON.stringify(inv.failingInput, null, 2)}</div>
                              {inv.shrinkPath && (
                                <div className="text-[11px] text-slate-400 pt-1">
                                  Caminho de Shrinking: {inv.shrinkPath.join(" ➔ ")}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extreme Inputs & Account Mutations Catalog from fuzzer.ts */}
                  {fuzzingReport.fuzzerSuiteReport && (
                    <div className="space-y-4 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
                          <Terminal className="w-4 h-4 text-rose-400" />
                          <span>Vetores de Entrada Extremos & Desbalanceamento de Accounts (src/utils/fuzzer.ts)</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {fuzzingReport.fuzzerSuiteReport.extremeInputsCatalog.numbers.length} valores numéricos • {fuzzingReport.fuzzerSuiteReport.extremeInputsCatalog.accounts.length} estados de accounts
                        </span>
                      </div>

                      {/* Extreme Numerical Inputs Grid */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Limites de Bordas Numéricas & Overflows (u64 / u32 / u8)</span>
                          <span className="text-[10px] text-slate-500 font-mono">Valores Literais de Borda</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {fuzzingReport.fuzzerSuiteReport.extremeInputsCatalog.numbers.map((numInput, idx) => (
                            <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold text-amber-400">
                                  {numInput.paramName} ({numInput.type})
                                </span>
                                <span className="px-1.5 py-0.5 text-[9px] rounded font-mono bg-slate-800 text-slate-300">
                                  {numInput.boundaryClass}
                                </span>
                              </div>
                              <div className="font-mono text-[11px] text-slate-200 truncate bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                {numInput.rawValue}
                              </div>
                              <div className="text-[10px] text-slate-400 leading-tight">
                                {numInput.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Extreme Account States Grid */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Estados Anômalos de Accounts, Desbalanceamento de Aluguel & Falsificação de Chaves</span>
                          <span className="text-[10px] text-slate-500 font-mono">Simulação de Invasor</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {fuzzingReport.fuzzerSuiteReport.extremeInputsCatalog.accounts.map((accInput, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                                accInput.isMaliciousOrExtreme
                                  ? "bg-slate-900/90 border-rose-900/40"
                                  : "bg-slate-900/50 border-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-indigo-300">{accInput.accountName}</span>
                                <span
                                  className={`px-2 py-0.5 text-[9px] font-mono rounded ${
                                    accInput.isMaliciousOrExtreme
                                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                                      : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  }`}
                                >
                                  {accInput.anomalyType}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded">
                                <div>Lamports: <span className="text-slate-200">{accInput.lamports}</span></div>
                                <div>Signer: <span className={accInput.isSigner ? "text-emerald-400" : "text-rose-400"}>{accInput.isSigner ? "true" : "false"}</span></div>
                                <div>Bump: <span className="text-slate-200">{accInput.bumpSeed}</span></div>
                                <div>Data: <span className="text-slate-200">{accInput.dataBytesLength} bytes</span></div>
                              </div>

                              <div className="text-[11px] text-slate-300 leading-snug">
                                {accInput.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-8">
                  <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-slate-300">Fuzzing não executado</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Clique em "Iniciar Fuzzing" para testar o contrato inteligente contra 10.000+ mutações aleatórias extremas.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: FORMAL VERIFICATION (SMT/SAT) */}
          {activeTab === "formal" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
                    <Binary className="w-5 h-5 text-cyan-400" />
                    <span>Verificação Formal & Prova Matemática (SMT/SAT Solver)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Demonstração matemática rigorosa de propriedades críticas de isolamento de estado, controle de acesso e solvência
                  </p>
                </div>

                <button
                  onClick={handleRunFormalVerification}
                  disabled={isRunningFormal}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-xs transition-all shadow-lg shadow-cyan-950/30 disabled:opacity-50 whitespace-nowrap"
                >
                  <Binary className={`w-4 h-4 ${isRunningFormal ? "animate-spin" : ""}`} />
                  <span>{isRunningFormal ? "Provando Teoremas..." : "Executar Provas Formais"}</span>
                </button>
              </div>

              {formalReport ? (
                <div className="space-y-6">
                  {/* Formal Verification Metrics Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/50">
                      <div className="text-xs text-emerald-400">Teoremas Provados</div>
                      <div className="text-2xl font-bold font-mono text-emerald-400">{formalReport.provedTheoremsCount}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Teoremas Desprovados</div>
                      <div className="text-2xl font-bold font-mono text-rose-400">{formalReport.disprovedTheoremsCount}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Não Verificáveis</div>
                      <div className="text-2xl font-bold font-mono text-amber-400">{formalReport.unverifiableCount}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Tempo do Solver SMT</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400">{formalReport.totalSolverTimeMs} ms</div>
                    </div>
                  </div>

                  {/* Mathematical Assumptions */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-cyan-300">Axiomas & Premissas Matemáticas do Prover:</div>
                    <div className="text-slate-400 font-mono space-y-1 pt-1">
                      {formalReport.mathematicalAssumptions.map((ass, idx) => (
                        <div key={idx}>• {ass}</div>
                      ))}
                    </div>
                  </div>

                  {/* Theorems List */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Condições de Verificação (VCs) e Teoremas
                    </div>

                    <div className="space-y-3">
                      {formalReport.verificationConditions.map((vc) => (
                        <div key={vc.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold text-slate-400">{vc.id}</span>
                              <span className="text-sm font-bold text-slate-200">{vc.theoremName}</span>
                            </div>

                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full font-mono ${vc.status === "PROVED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : vc.status === "DISPROVED" ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-amber-950 text-amber-400 border border-amber-800"}`}>
                              {vc.status}
                            </span>
                          </div>

                          <div className="bg-slate-900 p-2.5 rounded font-mono text-xs text-cyan-300 border border-slate-800">
                            Fórmula Lógica: {vc.formalLogicFormula}
                          </div>

                          <p className="text-xs text-slate-300">{vc.mathematicalProofSummary}</p>

                          {vc.counterexample && (
                            <div className="bg-slate-900 p-3 rounded-lg border border-rose-900/40 text-xs font-mono text-rose-300 space-y-1">
                              <div className="font-semibold text-rose-400">Contraexemplo Simbólico Encontrado pelo SMT:</div>
                              <div>State: {JSON.stringify(vc.counterexample.symbolicState)}</div>
                              <div className="pt-1 text-slate-400">Trace:</div>
                              {vc.counterexample.failingTrace.map((t, idx) => (
                                <div key={idx} className="pl-2">• {t}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-8">
                  <Binary className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-slate-300">Nenhum teorema verificado</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Clique em "Executar Provas Formais" para gerar as condições de verificação simbólicas e provar a segurança matematicamente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: DEEP CPI INTEGRATION ANALYZER */}
          {activeTab === "cpi" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-200 flex items-center space-x-2">
                    <GitMerge className="w-5 h-5 text-purple-400" />
                    <span>Análise Profunda de Chamadas Cross-Instruction (CPI)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mapeamento de profundidade de invocações entre contratos, sequestro de programas e vetores de integração com DEXes/Lending
                  </p>
                </div>

                <button
                  onClick={handleRunCpiAnalysis}
                  disabled={isRunningCpi}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium text-xs transition-all shadow-lg shadow-purple-950/30 disabled:opacity-50 whitespace-nowrap"
                >
                  <GitMerge className={`w-4 h-4 ${isRunningCpi ? "animate-spin" : ""}`} />
                  <span>{isRunningCpi ? "Analisando Invocações CPI..." : "Mapear Chamadas CPI"}</span>
                </button>
              </div>

              {cpiReport ? (
                <div className="space-y-6">
                  {/* CPI Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Pontos CPI Detectados</div>
                      <div className="text-2xl font-bold font-mono text-purple-400">{cpiReport.totalCpiCallsDetected}</div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Profundidade Máxima CPI</div>
                      <div className="text-2xl font-bold font-mono text-indigo-400">Nível {cpiReport.maxCpiDepth}</div>
                    </div>
                    <div className={`bg-slate-950 p-4 rounded-xl border ${cpiReport.risksCount === 0 ? "border-emerald-900/50" : "border-rose-900/50"}`}>
                      <div className="text-xs text-slate-400">Riscos de Integração</div>
                      <div className={`text-2xl font-bold font-mono ${cpiReport.risksCount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {cpiReport.risksCount}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs text-slate-400">Integração SPL Token</div>
                      <div className="text-2xl font-bold font-mono text-cyan-400">
                        {cpiReport.protocolTopology.tokenIntegrations > 0 ? "Ativa" : "Direta"}
                      </div>
                    </div>
                  </div>

                  {/* CPI Nodes Map */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Mapa de Grafo de Invocação CPI (Cross-Program Calls)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cpiReport.cpiNodes.map((node) => (
                        <div key={node.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-purple-400">{node.id}</span>
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-950 text-purple-300 border border-purple-800">
                              {node.targetProgramType}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-slate-200">{node.targetProgram}</div>
                          <div className="text-xs font-mono text-slate-400">Instrução: {node.instructionName}</div>

                          <div className="pt-2 flex items-center justify-between text-xs font-mono">
                            <span className={node.isSignedCpi ? "text-emerald-400" : "text-slate-500"}>
                              {node.isSignedCpi ? "✓ invoke_signed()" : "• invoke() simples"}
                            </span>
                            <span className={node.programIdCheckPresent ? "text-emerald-400" : "text-rose-400"}>
                              {node.programIdCheckPresent ? "✓ Check ID OK" : "⚠️ Missing ID Check"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Integration Risks List */}
                  {cpiReport.integrationRisks.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Vulnerabilidades de Integração Multi-Protocolo Detectadas
                      </div>

                      <div className="space-y-3">
                        {cpiReport.integrationRisks.map((risk) => (
                          <div key={risk.id} className="bg-slate-950 p-4 rounded-xl border border-rose-900/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-rose-300">{risk.title}</span>
                              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                                {risk.severity}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300">{risk.description}</p>

                            <div className="bg-slate-900 p-2.5 rounded font-mono text-xs text-amber-300 border border-slate-800">
                              Localização: {risk.location}
                            </div>

                            <div className="text-xs font-sans text-emerald-400 bg-emerald-950/30 p-2.5 rounded border border-emerald-900/40">
                              Recomendação: {risk.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-8">
                  <GitMerge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-slate-300">Análise de CPI não iniciada</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Clique em "Mapear Chamadas CPI" para examinar as invocações entre programas e validar restrições de segurança.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: BPMN 2.0 PROCESS */}
          {activeTab === "bpmn" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="font-semibold text-slate-200">Processo BPMN 2.0: DevSecOps & CI/CD Pipeline</h3>
                  <p className="text-xs text-slate-400">
                    Modelagem formal de processos de negócios e orquestração de tarefas para auditoria de cibersegurança
                  </p>
                </div>
                <button
                  onClick={handleDownloadBpmnXml}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Baixar XML BPMN 2.0</span>
                </button>
              </div>

              {/* Visual BPMN Flow Diagram */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Fluxo Visual Sequencial do Processo BPMN
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bpmnProcess.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="relative p-4 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {node.type}
                        </span>
                        <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-100">{node.name}</div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{node.documentation}</p>
                      </div>
                      {node.assignee && (
                        <div className="text-[11px] font-mono text-cyan-400 bg-slate-950/80 p-1.5 rounded border border-slate-800">
                          Atribuído: {node.assignee}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOA CATALOG */}
          {activeTab === "soa" && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-slate-200">Arquitetura Orientada a Serviços (SOA)</h3>
                <p className="text-xs text-slate-400">
                  Catálogo de microsserviços e contratos de RPC expostos no sistema com monitoramento de status
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {soaServices.map((service) => (
                  <div key={service.serviceId} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Server className="w-5 h-5 text-cyan-400" />
                        <h4 className="font-bold text-sm text-slate-100">{service.name}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {service.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                      <span>ID: {service.serviceId}</span>
                      <span>•</span>
                      <span>Protocolo: {service.protocol}</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <div className="text-xs font-semibold text-slate-400">Métodos do Contrato:</div>
                      {service.methods.map((method, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-2 rounded text-xs space-y-1 border border-slate-800">
                          <div className="font-mono text-indigo-300 font-semibold">{method.name}()</div>
                          <div className="text-slate-400 text-[11px]">{method.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DDD ARCHITECTURE */}
          {activeTab === "ddd" && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-slate-200">Domain-Driven Design (DDD) & Contextos Delimitados</h3>
                <p className="text-xs text-slate-400">
                  Mapeamento de Entidades, Value Objects, Agregados e Invariantes de Domínio
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bounded Context 1 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <Boxes className="w-5 h-5" />
                    <span>SmartContract Domain</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gerencia o ciclo de vida de análise e validação de invariantes do código Rust/Anchor.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="text-indigo-300 font-semibold">Value Objects:</div>
                    <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                      • ProgramAddress<br />
                      • PdaSeed<br />
                      • AccountSpace
                    </div>
                    <div className="text-indigo-300 font-semibold pt-1">Aggregates:</div>
                    <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                      • SmartContractAuditAggregate
                    </div>
                  </div>
                </div>

                {/* Bounded Context 2 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                    <Workflow className="w-5 h-5" />
                    <span>DevSecOps Domain</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Gerencia o fluxo orquestrado de CI/CD, gateways de qualidade e atestações de segurança.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="text-indigo-300 font-semibold">Entities:</div>
                    <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                      • BpmnNode<br />
                      • BpmnSequenceFlow<br />
                      • PipelineStep
                    </div>
                    <div className="text-indigo-300 font-semibold pt-1">Aggregates:</div>
                    <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                      • BpmnProcessExecutionState
                    </div>
                  </div>
                </div>

                {/* Bounded Context 3 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <Cpu className="w-5 h-5" />
                    <span>Integration Domain</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Modula a comunicação externa com GitHub, Gemini AI e protocolo MCP via STDIO.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="text-indigo-300 font-semibold">Infrastructure Services:</div>
                    <div className="text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                      • McpProtocolService<br />
                      • GitHubSyncService<br />
                      • GeminiAiService
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
