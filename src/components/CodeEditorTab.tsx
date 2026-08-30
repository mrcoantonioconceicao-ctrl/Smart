import React, { useState } from "react";
import { FileCode, Play, Copy, Check, ShieldCheck, Cpu, Download, Sparkles, RefreshCw } from "lucide-react";
import { REPO_INFO } from "../data/contractData";

interface CodeEditorTabProps {
  rustCode: string;
  setRustCode: (code: string) => void;
  clientTsCode: string;
  setClientTsCode: (code: string) => void;
  idlJson: string;
  anchorToml: string;
  cargoToml: string;
  onRunAudit: () => void;
  onOpenAiModal: () => void;
  onResetToRepo: () => void;
}

export const CodeEditorTab: React.FC<CodeEditorTabProps> = ({
  rustCode,
  setRustCode,
  clientTsCode,
  setClientTsCode,
  idlJson,
  anchorToml,
  cargoToml,
  onRunAudit,
  onOpenAiModal,
  onResetToRepo,
}) => {
  const [activeFile, setActiveFile] = useState<"rust" | "client" | "idl" | "anchor" | "cargo">("rust");
  const [copied, setCopied] = useState(false);

  const getActiveCode = () => {
    switch (activeFile) {
      case "rust":
        return rustCode;
      case "client":
        return clientTsCode;
      case "idl":
        return idlJson;
      case "anchor":
        return anchorToml;
      case "cargo":
        return cargoToml;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    if (activeFile === "rust") {
      setRustCode(newCode);
    } else if (activeFile === "client") {
      setClientTsCode(newCode);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const fileNames: Record<string, string> = {
      rust: "lib.rs",
      client: "index.ts",
      idl: "solana_sandbox_counter.json",
      anchor: "Anchor.toml",
      cargo: "Cargo.toml",
    };
    const blob = new Blob([getActiveCode()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileNames[activeFile];
    a.click();
  };

  const insertSnippet = (snippetType: "decrement" | "checked_add" | "reset") => {
    if (activeFile !== "rust") return;

    if (snippetType === "decrement") {
      const codeToInsert = `
    pub fn decrement(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        require!(counter.count > 0, ErrorCode::Underflow);
        counter.count -= 1;
        Ok(())
    }`;
      const updated = rustCode.replace("        Ok(())\n    }\n}", `        Ok(())\n    }${codeToInsert}\n}`);
      setRustCode(updated);
    } else if (snippetType === "checked_add") {
      const updated = rustCode.replace(
        "counter.count += 1;",
        "counter.count = counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;"
      );
      setRustCode(updated);
    } else if (snippetType === "reset") {
      const codeToInsert = `
    pub fn reset(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }`;
      const updated = rustCode.replace("        Ok(())\n    }\n}", `        Ok(())\n    }${codeToInsert}\n}`);
      setRustCode(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Smart Contract Rust Anchor Editor &amp; Inspector
            </h2>
            <span className="text-xs bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-800">
              Program ID: {REPO_INFO.programId.slice(0, 8)}...{REPO_INFO.programId.slice(-6)}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Arquivos exportados do repositório <strong className="text-slate-200">{REPO_INFO.owner}/{REPO_INFO.repo}</strong>.
            Edite o código em tempo real para re-auditar as regras de segurança AST.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onResetToRepo}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restaurar Repositório</span>
          </button>

          <button
            onClick={onRunAudit}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Executar Auditoria AST</span>
          </button>

          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Análise DevSecOps Gemini AI</span>
          </button>
        </div>
      </div>

      {/* Main File Explorer & Code Textarea */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* File Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 overflow-x-auto">
          <div className="flex items-center space-x-1 py-1.5">
            <button
              onClick={() => setActiveFile("rust")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFile === "rust"
                  ? "bg-slate-800 text-indigo-400 border border-indigo-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>programs/.../lib.rs</span>
            </button>

            <button
              onClick={() => setActiveFile("client")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFile === "client"
                  ? "bg-slate-800 text-cyan-400 border border-cyan-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>client/index.ts</span>
            </button>

            <button
              onClick={() => setActiveFile("idl")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFile === "idl"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>target/idl/*.json</span>
            </button>

            <button
              onClick={() => setActiveFile("anchor")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFile === "anchor"
                  ? "bg-slate-800 text-purple-400 border border-purple-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <span>Anchor.toml</span>
            </button>

            <button
              onClick={() => setActiveFile("cargo")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeFile === "cargo"
                  ? "bg-slate-800 text-amber-400 border border-amber-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <span>Cargo.toml</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 py-1.5">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 rounded-md border border-slate-800 transition-colors"
              title="Copiar código"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownloadFile}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 rounded-md border border-slate-800 transition-colors"
              title="Baixar arquivo"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Snippet Injectors for Rust */}
        {activeFile === "rust" && (
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 overflow-x-auto">
            <span className="font-semibold text-slate-300">Ações Rápidas de Código (DevSecOps Refactoring):</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => insertSnippet("decrement")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition-colors"
              >
                + Adicionar Método decrement()
              </button>
              <button
                onClick={() => insertSnippet("checked_add")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 transition-colors"
              >
                + Inserir checked_add (Overflow Safe)
              </button>
              <button
                onClick={() => insertSnippet("reset")}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 transition-colors"
              >
                + Adicionar Método reset()
              </button>
            </div>
          </div>
        )}

        {/* Code Content Area */}
        <div className="relative font-mono text-sm">
          <textarea
            value={getActiveCode()}
            onChange={handleCodeChange}
            readOnly={activeFile !== "rust" && activeFile !== "client"}
            rows={22}
            className="w-full bg-slate-950 text-slate-200 p-4 focus:outline-none resize-none font-mono text-xs leading-relaxed border-none focus:ring-1 focus:ring-indigo-500/50"
            spellCheck={false}
          />
        </div>

        {/* Footer Code Info */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
          <div>
            <span>Linhas: {getActiveCode().split("\n").length}</span> |{" "}
            <span>Tamanho: {new Blob([getActiveCode()]).size} bytes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Anchor eDSL Rust v0.30.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
