import React, { useState, useEffect } from "react";
import {
  X,
  GitFork,
  GitPullRequest,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Github,
  Key,
  Lock,
  ArrowRight,
  RefreshCw,
  FileCode,
  Sparkles,
  Layers,
  Copy,
  Check,
  Code2,
  BookOpen
} from "lucide-react";
import { GitHubUser, GitHubForkInfo, GitHubPushResult } from "../types";
import { REPO_INFO, INITIAL_RUST_CODE, COMMIT_PRESETS } from "../data/contractData";

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  rustCode: string;
  clientTsCode: string;
  readmeMd: string;
  anchorToml: string;
  cargoToml: string;
  githubToken: string | null;
  setGithubToken: (token: string | null) => void;
  githubUser: GitHubUser | null;
  setGithubUser: (user: GitHubUser | null) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  rustCode,
  clientTsCode,
  readmeMd,
  anchorToml,
  cargoToml,
  githubToken,
  setGithubToken,
  githubUser,
  setGithubUser,
}) => {
  const [authMode, setAuthMode] = useState<"oauth" | "pat">("oauth");
  const [patInput, setPatInput] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fork state
  const [forkInfo, setForkInfo] = useState<GitHubForkInfo | null>(null);
  const [isCheckingFork, setIsCheckingFork] = useState(false);
  const [isCreatingFork, setIsCreatingFork] = useState(false);
  const [forkError, setForkError] = useState<string | null>(null);

  // Commit / Push configuration
  const [targetBranch, setTargetBranch] = useState("main");
  const [commitMessage, setCommitMessage] = useState(
    "feat(anchor): update Rust smart contract with AST security fixes and DevSecOps docs"
  );
  const [selectedFiles, setSelectedFiles] = useState<{
    rust: boolean;
    client: boolean;
    readme: boolean;
    anchor: boolean;
    cargo: boolean;
  }>({
    rust: true,
    client: false,
    readme: true,
    anchor: false,
    cargo: false,
  });

  // Push status
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<GitHubPushResult | null>(null);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Diff inspection toggle
  const [showDiff, setShowDiff] = useState(false);

  // Runtime OAuth callback URLs from context
  const devCallbackUrl = "https://ais-dev-p2d7g46w2t5a2dr6dis7ip-385239450740.us-east5.run.app/auth/callback";
  const sharedCallbackUrl = "https://ais-pre-p2d7g46w2t5a2dr6dis7ip-385239450740.us-east5.run.app/auth/callback";

  // Check user details on token set
  useEffect(() => {
    if (githubToken && !githubUser) {
      fetchUserProfile(githubToken);
    }
  }, [githubToken, githubUser]);

  // Check fork when user is present
  useEffect(() => {
    if (githubToken && githubUser) {
      checkForkStatus(githubToken, githubUser.login);
    }
  }, [githubToken, githubUser]);

  // Listen for OAuth Popup Message
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
        return;
      }

      if (event.data?.type === "GITHUB_AUTH_SUCCESS" && event.data.token) {
        setGithubToken(event.data.token);
        setIsLoadingAuth(false);
        setAuthError(null);
        fetchUserProfile(event.data.token);
      } else if (event.data?.type === "GITHUB_AUTH_ERROR") {
        setIsLoadingAuth(false);
        setAuthError(event.data.error || "Falha na autorização do GitHub OAuth.");
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const fetchUserProfile = async (token: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/github/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Não foi possível validar o token do GitHub.");
      }
      const data: GitHubUser = await res.json();
      setGithubUser(data);
      checkForkStatus(token, data.login);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleOAuthLogin = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/github/url");
      const data = await res.json();

      if (!data.configured) {
        setAuthMode("pat");
        setAuthError(
          "Configuração de OAuth App não detectada nas variáveis de ambiente. Você pode usar um Personal Access Token (PAT) com escopo 'repo' ou 'public_repo' abaixo."
        );
        setIsLoadingAuth(false);
        return;
      }

      const authWindow = window.open(
        data.url,
        "github_oauth_popup",
        "width=650,height=750,menubar=no,toolbar=no"
      );

      if (!authWindow) {
        setAuthError("O navegador bloqueou a janela popup. Por favor, permita popups para este site.");
        setIsLoadingAuth(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "Erro ao iniciar fluxo OAuth.");
      setIsLoadingAuth(false);
    }
  };

  const handlePatLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) {
      setAuthError("Por favor, insira o seu GitHub Personal Access Token.");
      return;
    }
    setGithubToken(patInput.trim());
    await fetchUserProfile(patInput.trim());
  };

  const checkForkStatus = async (token: string, username: string) => {
    setIsCheckingFork(true);
    setForkError(null);
    try {
      const res = await fetch(`/api/github/check-fork?owner=${encodeURIComponent(username)}&repo=${REPO_INFO.repo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao consultar repositório fork.");
      }
      if (data.exists) {
        setForkInfo(data.forkData);
        if (data.forkData?.defaultBranch) {
          setTargetBranch(data.forkData.defaultBranch);
        }
      } else {
        setForkInfo({ exists: false });
      }
    } catch (err: any) {
      setForkError(err.message);
    } finally {
      setIsCheckingFork(false);
    }
  };

  const handleCreateFork = async () => {
    if (!githubToken || !githubUser) return;
    setIsCreatingFork(true);
    setForkError(null);
    try {
      const res = await fetch("/api/github/create-fork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
        },
        body: JSON.stringify({
          upstreamOwner: REPO_INFO.owner,
          repo: REPO_INFO.repo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao solicitar criação de fork ao GitHub.");
      }

      // GitHub fork may take a moment to initialize; poll once after 2 seconds
      setTimeout(() => {
        checkForkStatus(githubToken, githubUser.login);
        setIsCreatingFork(false);
      }, 2500);
    } catch (err: any) {
      setForkError(err.message);
      setIsCreatingFork(false);
    }
  };

  const handlePushCommit = async () => {
    if (!githubToken || !githubUser) return;

    setIsPushing(true);
    setPushResult(null);
    setPushLogs(["Iniciando pipeline de push para o repositório remoto..."]);

    try {
      const filesToPush: { path: string; content: string; name: string }[] = [];

      if (selectedFiles.rust) {
        filesToPush.push({
          path: "programs/solana_sandbox_counter/src/lib.rs",
          content: rustCode,
          name: "lib.rs (Anchor Rust)",
        });
      }
      if (selectedFiles.client) {
        filesToPush.push({
          path: "client/index.ts",
          content: clientTsCode,
          name: "client/index.ts (TypeScript Client)",
        });
      }
      if (selectedFiles.readme) {
        filesToPush.push({
          path: "README.md",
          content: readmeMd,
          name: "README.md (DevSecOps Docs)",
        });
      }
      if (selectedFiles.anchor) {
        filesToPush.push({
          path: "Anchor.toml",
          content: anchorToml,
          name: "Anchor.toml",
        });
      }
      if (selectedFiles.cargo) {
        filesToPush.push({
          path: "programs/solana_sandbox_counter/Cargo.toml",
          content: cargoToml,
          name: "Cargo.toml",
        });
      }

      if (filesToPush.length === 0) {
        throw new Error("Selecione pelo menos um arquivo para enviar no commit.");
      }

      let lastResult: GitHubPushResult | null = null;

      for (const file of filesToPush) {
        setPushLogs((prev) => [...prev, `[1/3] Obtendo SHA e referências para ${file.path}...`]);

        const res = await fetch("/api/github/push-commit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${githubToken}`,
          },
          body: JSON.stringify({
            targetOwner: githubUser.login,
            repo: REPO_INFO.repo,
            branch: targetBranch || "main",
            filePath: file.path,
            fileContent: file.content,
            commitMessage: commitMessage,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Falha ao enviar commit para ${file.name}`);
        }

        setPushLogs((prev) => [
          ...prev,
          `[2/3] Gravado commit ${data.commitSha?.slice(0, 7)} em ${githubUser.login}/${REPO_INFO.repo}@${targetBranch}`,
        ]);
        lastResult = data;
      }

      setPushLogs((prev) => [
        ...prev,
        `[3/3] Push concluído com sucesso! Arquivos sincronizados no seu fork.`,
      ]);
      setPushResult(lastResult);
    } catch (err: any) {
      setPushLogs((prev) => [...prev, `[ERRO] Falha no push: ${err.message}`]);
      setPushResult({ success: false, error: err.message });
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleLogout = () => {
    setGithubToken(null);
    setGithubUser(null);
    setForkInfo(null);
    setPushResult(null);
    setPushLogs([]);
  };

  if (!isOpen) return null;

  // Simple line diff calculation for Rust code
  const originalLines = INITIAL_RUST_CODE.split("\n");
  const currentLines = rustCode.split("\n");
  const isCodeModified = rustCode.trim() !== INITIAL_RUST_CODE.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  GitHub Fork &amp; Push Sincronizador
                </h3>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-mono">
                  {REPO_INFO.repo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autentique-se no GitHub para enviar seu contrato inteligente modificado para o seu próprio fork
              </p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* STEP 1: Authentication */}
          {!githubUser ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-slate-200 text-sm">
                    Passo 1: Autenticar com sua Conta GitHub
                  </h4>
                </div>
                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setAuthMode("oauth")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      authMode === "oauth" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    OAuth Popup
                  </button>
                  <button
                    onClick={() => setAuthMode("pat")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      authMode === "pat" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Personal Access Token
                  </button>
                </div>
              </div>

              {authError && (
                <div className="bg-rose-950/60 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === "oauth" ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Conecte-se com sua conta GitHub em uma janela popup segura para autorizar a sincronização de código e criação de forks.
                  </p>

                  <button
                    onClick={handleOAuthLogin}
                    disabled={isLoadingAuth}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-50"
                  >
                    {isLoadingAuth ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Aguardando autorização no popup...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4" />
                        <span>Conectar com GitHub via OAuth</span>
                      </>
                    )}
                  </button>

                  {/* OAuth Configuration Details Collapsible */}
                  <details className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
                    <summary className="cursor-pointer font-semibold text-slate-200 hover:text-cyan-400 flex items-center justify-between">
                      <span>Como configurar seu próprio GitHub OAuth App</span>
                      <span className="text-[10px] text-slate-400">(Opcional)</span>
                    </summary>
                    <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                      <p className="text-slate-300 font-sans">
                        Se você deseja utilizar suas próprias credenciais de OAuth, configure no GitHub Developer Settings as URLs de callback exatas:
                      </p>
                      <div>
                        <span className="text-slate-400 block font-sans">Development Callback URL:</span>
                        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-800 text-cyan-300 text-[10px]">
                          <span className="truncate">{devCallbackUrl}</span>
                          <button
                            onClick={() => handleCopyText(devCallbackUrl, "dev")}
                            className="text-slate-400 hover:text-slate-200 ml-2"
                          >
                            {copiedUrl === "dev" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-sans">Shared Callback URL:</span>
                        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded border border-slate-800 text-cyan-300 text-[10px]">
                          <span className="truncate">{sharedCallbackUrl}</span>
                          <button
                            onClick={() => handleCopyText(sharedCallbackUrl, "shared")}
                            className="text-slate-400 hover:text-slate-200 ml-2"
                          >
                            {copiedUrl === "shared" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              ) : (
                <form onSubmit={handlePatLogin} className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Insira um GitHub Personal Access Token (classic ou fine-grained) com permissão de leitura e escrita em repositórios (escopo <code className="text-indigo-300">repo</code> ou <code className="text-indigo-300">public_repo</code>).
                  </p>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      value={patInput}
                      onChange={(e) => setPatInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo,public_repo&description=Solana+Anchor+DevSecOps+IDE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Gerar novo token no GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="submit"
                      disabled={isLoadingAuth || !patInput}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
                    >
                      {isLoadingAuth ? "Validando Token..." : "Salvar e Conectar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Logged in User Profile Card */
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  className="w-12 h-12 rounded-full border-2 border-indigo-500"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100">{githubUser.name || githubUser.login}</span>
                    <span className="text-xs text-indigo-400 font-mono">@{githubUser.login}</span>
                  </div>
                  <a
                    href={githubUser.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 mt-0.5"
                  >
                    <span>Ver perfil no GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => checkForkStatus(githubToken!, githubUser.login)}
                  disabled={isCheckingFork}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 flex items-center space-x-1.5"
                  title="Atualizar status do fork"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingFork ? "animate-spin text-cyan-400" : ""}`} />
                  <span>Verificar Fork</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs border border-rose-800 transition-colors"
                >
                  Desconectar
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Fork Verification and Creation */}
          {githubUser && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitFork className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-bold text-slate-200 text-sm">
                    Passo 2: Fork de {REPO_INFO.owner}/{REPO_INFO.repo}
                  </h4>
                </div>
                {isCheckingFork && (
                  <span className="text-xs text-cyan-400 flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Verificando...</span>
                  </span>
                )}
              </div>

              {forkError && (
                <div className="bg-rose-950/60 border border-rose-800 rounded-lg p-3 text-xs text-rose-200">
                  {forkError}
                </div>
              )}

              {forkInfo?.exists ? (
                <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-bold text-xs">Fork Ativo e Configurado:</span>
                      <span className="font-mono font-bold text-slate-100">{githubUser.login}/{REPO_INFO.repo}</span>
                    </div>
                    <a
                      href={`https://github.com/${githubUser.login}/${REPO_INFO.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Abrir no GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-300">
                    O repositório fork foi encontrado na sua conta. Você pode enviar commits diretamente para a branch <strong className="text-cyan-300 font-mono">{targetBranch}</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-slate-100">
                        Nenhum fork de <span className="font-mono text-cyan-400">{REPO_INFO.repo}</span> encontrado em @{githubUser.login}.
                      </p>
                      <p className="text-slate-400">
                        Para enviar suas modificações e criar Pull Requests, crie um fork do repositório upstream oficial (<code className="text-slate-300">{REPO_INFO.owner}/{REPO_INFO.repo}</code>).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateFork}
                    disabled={isCreatingFork}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50"
                  >
                    {isCreatingFork ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Criando fork no GitHub...</span>
                      </>
                    ) : (
                      <>
                        <GitFork className="w-4 h-4" />
                        <span>Criar Fork {githubUser.login}/{REPO_INFO.repo} Automaticamente</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Files to Commit & Diff */}
          {githubUser && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-slate-200 text-sm">
                    Passo 3: Arquivos Modificados &amp; Commit
                  </h4>
                </div>
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-mono"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showDiff ? "Ocultar Diff de Código" : "Visualizar Diff Rust"}</span>
                </button>
              </div>

              {/* Code Modification Status */}
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isCodeModified ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                  <span className="text-slate-300">
                    Status do Código: {isCodeModified ? (
                      <strong className="text-emerald-400">Modificado localmente no editor</strong>
                    ) : (
                      <span className="text-slate-400">Idêntico ao repositório original</span>
                    )}
                  </span>
                </div>
                <span className="font-mono text-slate-400">
                  {currentLines.length} linhas ({rustCode.length} bytes)
                </span>
              </div>

              {/* Diff Viewer if toggled */}
              {showDiff && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-60 overflow-y-auto font-mono text-[11px] space-y-1">
                  <div className="text-slate-500 pb-1 border-b border-slate-800 mb-2">
                    --- original/programs/solana_sandbox_counter/src/lib.rs
                    <br />
                    +++ modified/programs/solana_sandbox_counter/src/lib.rs
                  </div>
                  {currentLines.map((line, idx) => {
                    const isNewOrModified = !originalLines.includes(line);
                    return (
                      <div
                        key={idx}
                        className={`px-1 rounded flex items-center space-x-2 ${
                          isNewOrModified ? "bg-emerald-950/70 text-emerald-300 font-semibold" : "text-slate-400"
                        }`}
                      >
                        <span className="w-6 text-slate-600 select-none">{idx + 1}</span>
                        <span>{isNewOrModified ? "+ " : "  "}{line}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Select files to include */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium block">
                  Selecione os arquivos a incluir no commit:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedFiles.rust}
                      onChange={(e) => setSelectedFiles({ ...selectedFiles, rust: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">lib.rs</span>
                      <span className="text-[10px] text-slate-500 block truncate">programs/.../lib.rs</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedFiles.client}
                      onChange={(e) => setSelectedFiles({ ...selectedFiles, client: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">index.ts</span>
                      <span className="text-[10px] text-slate-500 block truncate">client/index.ts</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedFiles.readme}
                      onChange={(e) => setSelectedFiles({ ...selectedFiles, readme: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-blue-400 block truncate">README.md</span>
                      <span className="text-[10px] text-slate-500 block truncate">Docs &amp; Spec</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedFiles.anchor}
                      onChange={(e) => setSelectedFiles({ ...selectedFiles, anchor: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">Anchor.toml</span>
                      <span className="text-[10px] text-slate-500 block truncate">Workspace</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={selectedFiles.cargo}
                      onChange={(e) => setSelectedFiles({ ...selectedFiles, cargo: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">Cargo.toml</span>
                      <span className="text-[10px] text-slate-500 block truncate">Rust package</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Target Branch and Commit Message */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs text-slate-400 font-medium block">Branch de Destino</label>
                  <input
                    type="text"
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs text-slate-400 font-medium block">Mensagem do Commit (Conventional Commits)</label>
                  <div className="relative">
                    <GitCommit className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Commit Preset Templates */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 block">Templates DevSecOps rápidos:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMIT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCommitMessage(preset.message)}
                      className={`text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded transition-colors ${
                        preset.type === "docs"
                          ? "text-blue-300"
                          : preset.type === "sec"
                          ? "text-emerald-300"
                          : preset.type === "ci"
                          ? "text-amber-300"
                          : "text-cyan-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push Action Button */}
              <button
                onClick={handlePushCommit}
                disabled={isPushing || !forkInfo?.exists}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/40 transition-all disabled:opacity-50"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Realizando Push para o Fork no GitHub...</span>
                  </>
                ) : (
                  <>
                    <GitCommit className="w-4 h-4" />
                    <span>Confirmar &amp; Fazer Push para {githubUser.login}/{REPO_INFO.repo}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Live Push Logs & Success Result */}
          {pushLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Terminal de Integração Git / GitHub REST
                </span>
                {pushResult?.success && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                    COMMIT PUSHED
                  </span>
                )}
              </div>

              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                {pushLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span className={log.includes("[ERRO]") ? "text-rose-400 font-bold" : log.includes("sucesso") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              {pushResult?.success && (
                <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-xl p-4 space-y-3 font-sans">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">Código Rust Anchor enviado com sucesso!</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {pushResult.commitUrl && (
                      <a
                        href={pushResult.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 rounded-lg text-xs font-semibold"
                      >
                        <GitCommit className="w-3.5 h-3.5" />
                        <span>Ver Commit: {pushResult.commitSha?.slice(0, 7)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {pushResult.fileUrl && (
                      <a
                        href={pushResult.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 rounded-lg text-xs font-semibold"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Ver lib.rs no seu Fork</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {githubUser && (
                      <a
                        href={`https://github.com/${REPO_INFO.owner}/${REPO_INFO.repo}/compare/main...${githubUser.login}:contratos-inteligentes:${targetBranch}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-900/30"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>Criar Pull Request para o Upstream</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
