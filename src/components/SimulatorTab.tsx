import React, { useState } from "react";
import { Cpu, Key, Wallet, Play, RotateCcw, Plus, Minus, Hash, CheckCircle, AlertCircle, Terminal, ExternalLink, ShieldAlert } from "lucide-react";
import { SolanaWallet, OnChainCounterAccount, TransactionLog } from "../types";
import { generateSolanaPubkey, deriveCounterPda, generateTxHash } from "../utils/solanaSimulator";
import { REPO_INFO } from "../data/contractData";

interface SimulatorTabProps {
  wallet: SolanaWallet;
  setWallet: React.Dispatch<React.SetStateAction<SolanaWallet>>;
  counterAccount: OnChainCounterAccount;
  setCounterAccount: React.Dispatch<React.SetStateAction<OnChainCounterAccount>>;
  cluster: string;
  txLogs: TransactionLog[];
  setTxLogs: React.Dispatch<React.SetStateAction<TransactionLog[]>>;
  onOpenLogsModal: () => void;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  wallet,
  setWallet,
  counterAccount,
  setCounterAccount,
  cluster,
  txLogs,
  setTxLogs,
  onOpenLogsModal,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Derive PDA based on current wallet
  const pdaInfo = deriveCounterPda(wallet.publicKey, REPO_INFO.programId);

  const handleGenerateWallet = () => {
    const newPubkey = generateSolanaPubkey();
    setWallet({
      publicKey: newPubkey,
      secretKeyDisplay: `[${Array.from({ length: 16 }, () => Math.floor(Math.random() * 255)).join(", ")}, ...]`,
      balanceSol: 5.0,
      isConnected: true,
    });
    // Reset account state for new wallet
    const newPda = deriveCounterPda(newPubkey, REPO_INFO.programId);
    setCounterAccount({
      isInitialized: false,
      pdaAddress: newPda.pdaAddress,
      authority: newPubkey,
      count: 0,
      bump: newPda.bump,
      rentExemptReserveSol: 0.0012384,
      dataLengthBytes: 49,
    });
  };

  const handleAirDrop = () => {
    setLoadingAction("airdrop");
    setTimeout(() => {
      setWallet((prev) => ({ ...prev, balanceSol: prev.balanceSol + 1.0 }));
      setLoadingAction(null);
    }, 400);
  };

  const executeInitialize = () => {
    setLoadingAction("initialize");
    setTimeout(() => {
      const txHash = generateTxHash();
      const slot = Math.floor(Math.random() * 5000) + 248000000;
      const cu = 11420;

      setCounterAccount({
        isInitialized: true,
        pdaAddress: pdaInfo.pdaAddress,
        authority: wallet.publicKey,
        count: 0,
        bump: pdaInfo.bump,
        rentExemptReserveSol: 0.0012384,
        dataLengthBytes: 49,
      });

      const newLog: TransactionLog = {
        id: txHash,
        timestamp: new Date().toLocaleTimeString(),
        signature: txHash,
        instruction: "initialize",
        status: "SUCCESS",
        slot,
        computeUnitsUsed: cu,
        accountsInvolved: [
          { name: "counter (PDA)", pubkey: pdaInfo.pdaAddress, isSigner: false, isWritable: true },
          { name: "authority", pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { name: "systemProgram", pubkey: "11111111111111111111111111111111", isSigner: false, isWritable: false },
        ],
        logs: [
          `Program ${REPO_INFO.programId} invoke [1]`,
          `Program log: Instruction: Initialize`,
          `Program log: Created PDA counter account with bump ${pdaInfo.bump}`,
          `Program log: Authority set to ${wallet.publicKey}`,
          `Program ${REPO_INFO.programId} consumed ${cu} of 200000 compute units`,
          `Program ${REPO_INFO.programId} success`,
        ],
      };

      setTxLogs((prev) => [newLog, ...prev]);
      setLoadingAction(null);
    }, 600);
  };

  const executeIncrement = () => {
    if (!counterAccount.isInitialized) return;
    setLoadingAction("increment");
    setTimeout(() => {
      const txHash = generateTxHash();
      const slot = Math.floor(Math.random() * 5000) + 248000000;
      const cu = 4850;

      setCounterAccount((prev) => ({ ...prev, count: prev.count + 1 }));

      const newLog: TransactionLog = {
        id: txHash,
        timestamp: new Date().toLocaleTimeString(),
        signature: txHash,
        instruction: "increment",
        status: "SUCCESS",
        slot,
        computeUnitsUsed: cu,
        accountsInvolved: [
          { name: "counter (PDA)", pubkey: pdaInfo.pdaAddress, isSigner: false, isWritable: true },
          { name: "authority", pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ],
        logs: [
          `Program ${REPO_INFO.programId} invoke [1]`,
          `Program log: Instruction: Increment`,
          `Program log: Verified seeds [counter, ${wallet.publicKey.slice(0, 8)}...] and bump ${pdaInfo.bump}`,
          `Program log: Verified has_one = authority`,
          `Program log: Updated count from ${counterAccount.count} to ${counterAccount.count + 1}`,
          `Program ${REPO_INFO.programId} consumed ${cu} of 200000 compute units`,
          `Program ${REPO_INFO.programId} success`,
        ],
      };

      setTxLogs((prev) => [newLog, ...prev]);
      setLoadingAction(null);
    }, 500);
  };

  const executeDecrement = () => {
    if (!counterAccount.isInitialized || counterAccount.count <= 0) return;
    setLoadingAction("decrement");
    setTimeout(() => {
      const txHash = generateTxHash();
      const cu = 4700;

      setCounterAccount((prev) => ({ ...prev, count: prev.count - 1 }));

      const newLog: TransactionLog = {
        id: txHash,
        timestamp: new Date().toLocaleTimeString(),
        signature: txHash,
        instruction: "decrement",
        status: "SUCCESS",
        slot: Math.floor(Math.random() * 5000) + 248000000,
        computeUnitsUsed: cu,
        accountsInvolved: [
          { name: "counter (PDA)", pubkey: pdaInfo.pdaAddress, isSigner: false, isWritable: true },
          { name: "authority", pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ],
        logs: [
          `Program ${REPO_INFO.programId} invoke [1]`,
          `Program log: Instruction: Decrement`,
          `Program log: Count decremented to ${counterAccount.count - 1}`,
          `Program ${REPO_INFO.programId} consumed ${cu} of 200000 compute units`,
          `Program ${REPO_INFO.programId} success`,
        ],
      };

      setTxLogs((prev) => [newLog, ...prev]);
      setLoadingAction(null);
    }, 450);
  };

  const executeReset = () => {
    if (!counterAccount.isInitialized) return;
    setLoadingAction("reset");
    setTimeout(() => {
      const txHash = generateTxHash();
      const cu = 3900;

      setCounterAccount((prev) => ({ ...prev, count: 0 }));

      const newLog: TransactionLog = {
        id: txHash,
        timestamp: new Date().toLocaleTimeString(),
        signature: txHash,
        instruction: "reset",
        status: "SUCCESS",
        slot: Math.floor(Math.random() * 5000) + 248000000,
        computeUnitsUsed: cu,
        accountsInvolved: [
          { name: "counter (PDA)", pubkey: pdaInfo.pdaAddress, isSigner: false, isWritable: true },
          { name: "authority", pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ],
        logs: [
          `Program ${REPO_INFO.programId} invoke [1]`,
          `Program log: Instruction: Reset`,
          `Program log: Counter reset to 0`,
          `Program ${REPO_INFO.programId} consumed ${cu} of 200000 compute units`,
          `Program ${REPO_INFO.programId} success`,
        ],
      };

      setTxLogs((prev) => [newLog, ...prev]);
      setLoadingAction(null);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Simulador de Execução dApp Solana Anchor</h2>
            <span className="text-xs bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
              Cluster: {cluster}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simule o ciclo completo de vida de contas PDA, derivação de chaves determinísticas e RPC Anchor no browser.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenLogsModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Ver Logs de Transação ({txLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Grid: Wallet Keypair & PDA Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Keypair Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">Carteira Solana Assinante (Authority)</h3>
            </div>
            <button
              onClick={handleGenerateWallet}
              className="text-xs px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded border border-indigo-800 font-mono transition-colors"
            >
              Gerar Nova Chave
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Public Key (Ed25519)</span>
              <span className="text-slate-100 font-bold break-all">{wallet.publicKey}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Secret Key Bytes</span>
              <span className="text-slate-400 text-[11px] truncate block">{wallet.secretKeyDisplay}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Saldo On-Chain:</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{wallet.balanceSol.toFixed(4)} SOL</span>
            </div>
            <button
              onClick={handleAirDrop}
              disabled={loadingAction === "airdrop"}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition-all"
            >
              {loadingAction === "airdrop" ? "AirDropping..." : "+ AirDrop 1 SOL"}
            </button>
          </div>
        </div>

        {/* PDA Derivation Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Derivação de Endereço PDA (Anchor)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Bump Canonical: {pdaInfo.bump}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Sementes (Seeds):</span>
              <span className="text-cyan-300 font-semibold">[b"counter", authority.key()]</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Program ID Target:</span>
              <span className="text-indigo-300">{REPO_INFO.programId.slice(0, 16)}...</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Endereço PDA Derivado</span>
              <span className="text-cyan-400 font-bold break-all text-xs">{pdaInfo.pdaAddress}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-800">
            💡 O PDA não possui chave privada. Apenas a lógica do programa Solana Anchor pode assinar transações neste endereço usando a semente <code className="text-cyan-300 font-mono">b"counter"</code>.
          </div>
        </div>
      </div>

      {/* Main Account State & Instruction Operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-100">Estado On-Chain da Conta PDA (UserCounter)</h3>
              {counterAccount.isInitialized ? (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>INICIALIZADA</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>NÃO INICIALIZADA</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Endereço PDA: <span className="font-mono text-slate-300">{counterAccount.pdaAddress}</span>
            </p>
          </div>

          {/* Action RPC Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!counterAccount.isInitialized ? (
              <button
                onClick={executeInitialize}
                disabled={loadingAction === "initialize"}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-emerald-900/30 transition-all transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>rpc.initialize()</span>
              </button>
            ) : (
              <>
                <button
                  onClick={executeIncrement}
                  disabled={loadingAction === "increment"}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-900/30 transition-all transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>rpc.increment()</span>
                </button>

                <button
                  onClick={executeDecrement}
                  disabled={loadingAction === "decrement" || counterAccount.count <= 0}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                >
                  <Minus className="w-4 h-4" />
                  <span>rpc.decrement()</span>
                </button>

                <button
                  onClick={executeReset}
                  disabled={loadingAction === "reset"}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 text-xs font-semibold border border-slate-700 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>rpc.reset()</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Counter Display & Account Field Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Big Number Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Valor do Contador (u64 On-Chain)
            </span>
            <div className="text-6xl font-black font-mono text-cyan-400 tracking-tight my-2">
              {counterAccount.count}
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1">
              Armazenado nos bytes 40-47 da conta PDA
            </span>
          </div>

          {/* Account Fields Detail */}
          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">authority (Pubkey)</span>
              <span className="text-slate-200 font-bold truncate max-w-[240px] md:max-w-xs">{counterAccount.authority}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">bump (u8 Canonical)</span>
              <span className="text-cyan-400 font-bold">{counterAccount.bump}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Isenção de Aluguel (Rent Reserve)</span>
              <span className="text-emerald-400 font-bold">{counterAccount.rentExemptReserveSol} SOL</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400">Tamanho da Estrutura</span>
              <span className="text-slate-300 font-bold">{counterAccount.dataLengthBytes} Bytes</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Snippet */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Últimas Transações Executadas</h4>
            <button onClick={onOpenLogsModal} className="text-xs text-indigo-400 hover:text-indigo-300">
              Ver Todos os Logs →
            </button>
          </div>

          {txLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
              Nenhuma transação executada ainda. Clique em <strong className="text-emerald-400">rpc.initialize()</strong> para iniciar.
            </div>
          ) : (
            <div className="space-y-2">
              {txLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                      {log.instruction.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[140px] sm:max-w-xs">
                      Hash: {log.signature.slice(0, 16)}...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                    <span>CU: {log.computeUnitsUsed}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
