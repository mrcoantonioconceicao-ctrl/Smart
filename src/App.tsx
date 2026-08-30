import React, { useState, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { CodeEditorTab } from "./components/CodeEditorTab";
import { SecurityAuditTab } from "./components/SecurityAuditTab";
import { SimulatorTab } from "./components/SimulatorTab";
import { DevSecOpsPipelineTab } from "./components/DevSecOpsPipelineTab";
import { AiAuditorModal } from "./components/AiAuditorModal";
import { TransactionLogsModal } from "./components/TransactionLogsModal";
import { ActiveTab, SolanaWallet, OnChainCounterAccount, TransactionLog } from "./types";
import {
  INITIAL_RUST_CODE,
  INITIAL_CLIENT_TS,
  INITIAL_IDL,
  INITIAL_ANCHOR_TOML,
  INITIAL_CARGO_TOML,
  REPO_INFO,
} from "./data/contractData";
import { auditRustContract } from "./utils/astAuditor";
import { createInitialWallet, createInitialCounterAccount, deriveCounterPda } from "./utils/solanaSimulator";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("audit");
  const [cluster, setCluster] = useState<string>("Localnet");

  // Code state initialized from mrcoantonioconceicao-ctrl/contratos-inteligentes
  const [rustCode, setRustCode] = useState<string>(INITIAL_RUST_CODE);
  const [clientTsCode, setClientTsCode] = useState<string>(INITIAL_CLIENT_TS);
  const [idlJson] = useState<string>(JSON.stringify(INITIAL_IDL, null, 2));
  const [anchorToml] = useState<string>(INITIAL_ANCHOR_TOML);
  const [cargoToml] = useState<string>(INITIAL_CARGO_TOML);

  // Solana Simulator State
  const [wallet, setWallet] = useState<SolanaWallet>(createInitialWallet());
  const initialPda = deriveCounterPda(wallet.publicKey, REPO_INFO.programId);
  const [counterAccount, setCounterAccount] = useState<OnChainCounterAccount>(
    createInitialCounterAccount(initialPda.pdaAddress, wallet.publicKey, initialPda.bump)
  );

  // Transaction Logs
  const [txLogs, setTxLogs] = useState<TransactionLog[]>([]);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Perform real-time AST Security Audit whenever rustCode changes
  const auditResult = useMemo(() => {
    return auditRustContract(rustCode);
  }, [rustCode]);

  const handleResetToRepo = () => {
    setRustCode(INITIAL_RUST_CODE);
    setClientTsCode(INITIAL_CLIENT_TS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        securityScore={auditResult.score}
        cluster={cluster}
        setCluster={setCluster}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "editor" && (
          <CodeEditorTab
            rustCode={rustCode}
            setRustCode={setRustCode}
            clientTsCode={clientTsCode}
            setClientTsCode={setClientTsCode}
            idlJson={idlJson}
            anchorToml={anchorToml}
            cargoToml={cargoToml}
            onRunAudit={() => setActiveTab("audit")}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onResetToRepo={handleResetToRepo}
          />
        )}

        {activeTab === "audit" && (
          <SecurityAuditTab
            score={auditResult.score}
            findings={auditResult.findings}
            spaceCalc={auditResult.spaceCalc}
            astNodes={auditResult.astNodes}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === "simulator" && (
          <SimulatorTab
            wallet={wallet}
            setWallet={setWallet}
            counterAccount={counterAccount}
            setCounterAccount={setCounterAccount}
            cluster={cluster}
            txLogs={txLogs}
            setTxLogs={setTxLogs}
            onOpenLogsModal={() => setIsLogsModalOpen(true)}
          />
        )}

        {activeTab === "pipeline" && <DevSecOpsPipelineTab />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Solana DevSecOps AST Suite</span>
            <span>•</span>
            <span>Baseado no repositório <strong className="text-slate-200">mrcoantonioconceicao-ctrl/contratos-inteligentes</strong></span>
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span>Anchor v0.30.0</span>
            <span>Program ID: Fg6PaFpo...sLnS</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AiAuditorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        rustCode={rustCode}
      />

      <TransactionLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        logs={txLogs}
      />
    </div>
  );
}
