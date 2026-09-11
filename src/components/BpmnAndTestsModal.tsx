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
} from "lucide-react";
import { TestRunner, TestSuiteSummary } from "../tests/unitTests";
import { BpmnDevSecOpsWorkflowEngine } from "../services/bpmnWorkflowService";
import { SoaCatalogRegistry } from "../services/soaCatalogService";

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
  const [activeTab, setActiveTab] = useState<"tests" | "bpmn" | "soa" | "ddd">("tests");
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

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
    }, 400);
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
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2">
          <button
            onClick={() => setActiveTab("tests")}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "tests"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Testes Automatizados</span>
            {testSummary && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-300">
                {testSummary.passedCount}/{testSummary.totalTests} Passed
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("bpmn")}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "bpmn"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Processo BPMN 2.0</span>
          </button>

          <button
            onClick={() => setActiveTab("soa")}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "soa"
                ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Serviços SOA</span>
          </button>

          <button
            onClick={() => setActiveTab("ddd")}
            className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "ddd"
                ? "border-amber-500 text-amber-400 bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Arquitetura DDD</span>
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

          {/* TAB 2: BPMN 2.0 PROCESS */}
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
