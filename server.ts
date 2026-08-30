import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to determine the public app redirect URI
  const getRedirectUri = (req: express.Request) => {
    if (process.env.APP_URL) {
      return `${process.env.APP_URL.replace(/\/$/, "")}/auth/callback`;
    }
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"] || req.get("host") || `localhost:${PORT}`;
    return `${protocol}://${host}/auth/callback`;
  };

  // 1. GitHub OAuth URL Endpoint
  app.get("/api/auth/github/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = getRedirectUri(req);
    const state = Math.random().toString(36).substring(2, 15);

    if (!clientId) {
      return res.json({
        configured: false,
        redirectUri,
        message: "GITHUB_CLIENT_ID não configurado. Você pode utilizar login com Personal Access Token (PAT) ou configurar as variáveis no AI Studio.",
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "repo,public_repo,user:email",
      state,
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    return res.json({ configured: true, url, clientId, redirectUri });
  });

  // 2. OAuth Callback Endpoint (Handles Popup Redirect)
  const callbackHandler: express.RequestHandler = async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>GitHub Auth Error</title></head>
          <body style="background:#090d16;color:#f87171;font-family:sans-serif;padding:30px;text-align:center;">
            <h3>Erro na Autorização GitHub</h3>
            <p>${error_description || error}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: '${error_description || error}' }, '*');
                setTimeout(() => window.close(), 2500);
              }
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send("Código de autorização não encontrado.");
    }

    try {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).send("Credenciais GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET não configuradas no servidor.");
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const accessToken = tokenData.access_token;

      // Render callback HTML that posts message to opener and closes
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Autenticação Concluída</title>
          </head>
          <body style="background:#020617;color:#e2e8f0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <div style="text-align:center;padding:24px;background:#0f172a;border:1px solid #1e293b;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.5);max-width:380px;">
              <div style="font-size:32px;margin-bottom:12px;">🛡️</div>
              <h2 style="font-size:18px;margin:0 0 8px;color:#38bdf8;font-weight:700;">GitHub Conectado com Sucesso!</h2>
              <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;">Sua sessão foi autorizada. Fechando esta janela...</p>
              <div style="font-size:11px;color:#64748b;font-family:monospace;">Token transmitido para o IDE</div>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                setTimeout(() => {
                  try { window.close(); } catch(e) {}
                }, 800);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Erro no callback OAuth GitHub:", err);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <body style="background:#090d16;color:#f87171;font-family:sans-serif;padding:30px;text-align:center;">
            <h3>Falha na Troca de Token GitHub</h3>
            <p>${err.message}</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: '${err.message}' }, '*');
              }
            </script>
          </body>
        </html>
      `);
    }
  };

  app.get(["/auth/callback", "/auth/callback/"], callbackHandler);

  // 3. GitHub User Profile Endpoint
  app.get("/api/github/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "") || (req.query.token as string);

      if (!token) {
        return res.status(401).json({ error: "Token de autorização não fornecido." });
      }

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-DevSecOps-IDE",
        },
      });

      if (!userRes.ok) {
        const errorText = await userRes.text();
        return res.status(userRes.status).json({ error: `Erro do GitHub API: ${errorText}` });
      }

      const userData = await userRes.json();
      return res.json(userData);
    } catch (err: any) {
      console.error("Erro ao buscar usuário GitHub:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Check if User has Fork of repository
  app.get("/api/github/check-fork", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "") || (req.query.token as string);
      const owner = req.query.owner as string;
      const repo = (req.query.repo as string) || "contratos-inteligentes";

      if (!token || !owner) {
        return res.status(400).json({ error: "Token e owner (username) são obrigatórios." });
      }

      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-DevSecOps-IDE",
        },
      });

      if (repoRes.status === 404) {
        return res.json({ exists: false });
      }

      if (!repoRes.ok) {
        const errJson = await repoRes.json();
        return res.status(repoRes.status).json({ error: errJson.message || "Erro ao verificar repositório" });
      }

      const repoData = await repoRes.json();
      return res.json({
        exists: true,
        forkData: {
          fullName: repoData.full_name,
          htmlUrl: repoData.html_url,
          defaultBranch: repoData.default_branch || "main",
          isFork: repoData.fork,
          parentRepo: repoData.parent ? repoData.parent.full_name : null,
          stars: repoData.stargazers_count,
          updatedAt: repoData.updated_at,
        },
      });
    } catch (err: any) {
      console.error("Erro ao checar fork:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 5. Create Fork of Upstream Repository
  app.post("/api/github/create-fork", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const { token: bodyToken, upstreamOwner, repo } = req.body;
      const token = authHeader?.replace("Bearer ", "") || bodyToken;
      const targetUpstream = upstreamOwner || "mrcoantonioconceicao-ctrl";
      const targetRepo = repo || "contratos-inteligentes";

      if (!token) {
        return res.status(401).json({ error: "Token não fornecido para criação de fork." });
      }

      const forkRes = await fetch(`https://api.github.com/repos/${targetUpstream}/${targetRepo}/forks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-DevSecOps-IDE",
        },
      });

      const forkData = await forkRes.json();
      if (!forkRes.ok) {
        return res.status(forkRes.status).json({ error: forkData.message || "Falha ao criar fork no GitHub." });
      }

      return res.json({
        success: true,
        fork: {
          fullName: forkData.full_name,
          htmlUrl: forkData.html_url,
          defaultBranch: forkData.default_branch || "main",
        },
      });
    } catch (err: any) {
      console.error("Erro ao criar fork:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 6. Push Modified Smart Contract Code to User's Fork
  app.post("/api/github/push-commit", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const {
        token: bodyToken,
        targetOwner,
        repo = "contratos-inteligentes",
        branch = "main",
        filePath = "programs/solana_sandbox_counter/src/lib.rs",
        fileContent,
        commitMessage = "DevSecOps: update Rust smart contract with AST security fixes",
      } = req.body;

      const token = authHeader?.replace("Bearer ", "") || bodyToken;

      if (!token || !targetOwner || !fileContent) {
        return res.status(400).json({
          error: "Campos obrigatórios ausentes: token, targetOwner ou fileContent.",
        });
      }

      // Step A: Fetch existing file SHA (if it exists) to allow updating the file
      let existingSha: string | undefined = undefined;
      const getFileRes = await fetch(
        `https://api.github.com/repos/${targetOwner}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Solana-DevSecOps-IDE",
          },
        }
      );

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        existingSha = fileData.sha;
      }

      // Step B: Create / Update File on GitHub Fork
      const putPayload: any = {
        message: commitMessage,
        content: Buffer.from(fileContent, "utf-8").toString("base64"),
        branch: branch,
      };

      if (existingSha) {
        putPayload.sha = existingSha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${targetOwner}/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-DevSecOps-IDE",
        },
        body: JSON.stringify(putPayload),
      });

      const putData = await putRes.json();

      if (!putRes.ok) {
        return res.status(putRes.status).json({
          error: putData.message || "Falha ao gravar commit no repositório GitHub.",
        });
      }

      return res.json({
        success: true,
        commitSha: putData.commit?.sha,
        commitUrl: putData.commit?.html_url,
        fileUrl: putData.content?.html_url,
        branch,
        repo: `${targetOwner}/${repo}`,
        filePath,
      });
    } catch (err: any) {
      console.error("Erro ao realizar push para GitHub:", err);
      return res.status(500).json({ error: err.message || "Erro durante o envio do commit." });
    }
  });

  // Gemini AI Security Audit API Endpoint
  app.post("/api/ai-analyze", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY não configurada no ambiente. Configure sua chave no AI Studio para habilitar a auditoria com IA.",
        });
      }

      const { code, focus } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Código Rust/Anchor não fornecido." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um Especialista Sênior em DevSecOps e Cibersegurança focado em Smart Contracts Solana Anchor.
Análise o seguinte código Rust/Anchor em busca de vulnerabilidades (Missing Signer, PDA Collision, Reentrancy, Overflow, Account Cosplay, Rent Exemption, Account Space validation, CPI safety):

Foco da Análise: ${focus || "Geral e Cibersegurança AST"}

Código a ser auditado:
\`\`\`rust
${code}
\`\`\`

Forneça uma resposta estruturada em Português com:
1. Resumo Executivo da Segurança (Score de 0 a 100)
2. Principais Achados de Segurança (Crítico, Alto, Médio, Baixo, Informativo)
3. Boas Práticas DevSecOps Aplicadas ou Recomendadas
4. Sugestões de Correção em Rust/Anchor com explicações técnicas de cibersegurança.`;

      // Priority list of models to try in case of temporary high demand (503) or rate limits
      const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let lastError: any = null;
      let textResult: string | null = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });

          if (response.text) {
            textResult = response.text;
            break;
          }
        } catch (modelErr: any) {
          lastError = modelErr;
          console.warn(`Tentativa com modelo ${modelName} falhou (${modelErr.message || modelErr}). Tentando próximo modelo...`);
          // Small pause before trying next fallback model
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (!textResult) {
        const errorMsg = lastError?.message || "Serviço temporariamente indisponível.";
        if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("UNAVAILABLE")) {
          return res.status(503).json({
            error: "Os modelos Gemini estão temporariamente com alta demanda. Por favor, aguarde alguns instantes e tente novamente.",
          });
        }
        return res.status(500).json({
          error: `Erro ao consultar Gemini AI: ${errorMsg}`,
        });
      }

      return res.json({ result: textResult });
    } catch (err: any) {
      console.error("Erro na API Gemini AI:", err);
      return res.status(500).json({ error: err.message || "Falha ao processar auditoria com Gemini AI." });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Solana Anchor DevSecOps Auditor" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor DevSecOps Solana rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();

