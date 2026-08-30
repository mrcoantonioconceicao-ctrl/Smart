import React, { useState } from "react";
import { X, Sparkles, Send, ShieldCheck, Loader2, FileCode, Check } from "lucide-react";

interface AiAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rustCode: string;
}

export const AiAuditorModal: React.FC<AiAuditorModalProps> = ({ isOpen, onClose, rustCode }) => {
  const [focus, setFocus] = useState("Auditoria Completa de Cibersegurança AST & Solana Anchor");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiAudit = async (selectedFocus?: string) => {
    const focusToUse = selectedFocus || focus;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: rustCode, focus: focusToUse }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha na resposta da API Gemini AI.");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao servidor Gemini AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">DevSecOps CyberSecurity Auditor (Gemini AI)</h3>
              <p className="text-xs text-slate-400">Análise profunda de vulnerabilidades Solana Anchor com IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Preset Buttons */}
          <div>
            <span className="font-semibold text-slate-300 block mb-2">Selecione o Foco da Auditoria DevSecOps:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Validação de PDA & Sementes (Seed Collision)",
                "Controle de Acesso & Signer Constraints",
                "Espaço de Conta & Rent Exemption (49 Bytes)",
                "Prevenção de Overflow & Arithmetic Safety",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setFocus(item);
                    handleRunAiAudit(item);
                  }}
                  className={`text-left p-2.5 rounded-lg border transition-all ${
                    focus === item
                      ? "bg-indigo-950 border-indigo-500 text-indigo-200 font-semibold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  ⚡ {item}
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Digite o foco da análise ou pergunta de segurança..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
            />
            <button
              onClick={() => handleRunAiAudit()}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-900/30 flex items-center space-x-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analisar com IA</span>
                </>
              )}
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-950/50 rounded-xl border border-slate-800">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-slate-300 font-medium">Analisando AST do Rust Anchor com Gemini AI...</span>
              <span className="text-slate-500 text-[11px]">Verificando macros #[program], seeds PDA, Signer e checked arithmetic</span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl space-y-1">
              <span className="font-bold block">🚨 Erro de Auditoria AI:</span>
              <p>{error}</p>
            </div>
          )}

          {/* Result display */}
          {result && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 text-emerald-300">
                <span className="font-semibold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Relatório de Auditoria Gemini AI Concluído</span>
                </span>
                <span className="font-mono text-[11px]">DevSecOps Verified</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-sans space-y-3 whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
