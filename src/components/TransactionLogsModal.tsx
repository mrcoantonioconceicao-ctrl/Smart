import React from "react";
import { X, Terminal, CheckCircle2, Hash, Layers, ExternalLink } from "lucide-react";
import { TransactionLog } from "../types";

interface TransactionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TransactionLog[];
}

export const TransactionLogsModal: React.FC<TransactionLogsModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">Explorer de Transações On-Chain Solana</h3>
              <p className="text-xs text-slate-400">Histórico detalhado de invocações de programas e logs de execução</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
              Nenhuma transação no histórico do simulador. Execute um RPC no Simulador Solana.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-indigo-300 text-sm">Instrução: {log.instruction}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                      SUCCESS
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Slot: {log.slot}</span>
                    <span>CU Usados: {log.computeUnitsUsed}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                {/* Signature */}
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Assinatura da Transação (Tx Hash)</span>
                  <span className="text-cyan-400 text-xs break-all font-bold">{log.signature}</span>
                </div>

                {/* Accounts Involved */}
                <div className="space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Contas Envolvidas no Contexto Anchor</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    {log.accountsInvolved.map((acc, idx) => (
                      <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800/80 flex justify-between items-center">
                        <div>
                          <span className="text-slate-300 font-bold block">{acc.name}</span>
                          <span className="text-slate-400 text-[10px] truncate max-w-[160px] block">{acc.pubkey}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[9px]">
                          {acc.isSigner && <span className="bg-amber-950 text-amber-300 px-1 py-0.5 rounded">SIGNER</span>}
                          {acc.isWritable && <span className="bg-indigo-950 text-indigo-300 px-1 py-0.5 rounded">MUTABLE</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program Execution Logs */}
                <div className="space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase">Program Runtime Execution Logs</span>
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-[11px] space-y-1 text-slate-300">
                    {log.logs.map((l, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="text-slate-600 select-none">&gt;</span>
                        <span className={l.includes("success") ? "text-emerald-400 font-bold" : ""}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
