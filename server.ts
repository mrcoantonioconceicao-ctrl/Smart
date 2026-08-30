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

  // Gemini AI Security Audit API Endpoint
  app.post("/api/ai-analyze", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY não configurada no ambiente."
        });
      }

      const { code, focus } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Código Rust/Anchor não fornecido." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um Especialista Sênior em DevSecOps e Cibersegurança focado em Smart Contracts Solana Anchor.
Análise o seguinte código Rust/Anchor em busca de vulnerabilidades (Missing Signer, PDA Collision, Reentrancy, Overflow, Account Cosplay, Rent Exemption, Account Space validation, CPI safety):

Foco da Análise: ${focus || 'Geral e Cibersegurança AST'}

Código a ser auditado:
\`\`\`rust
${code}
\`\`\`

Forneça uma resposta estruturada em Português com:
1. Resumo Executivo da Segurança (Score de 0 a 100)
2. Principais Achados de Segurança (Crítico, Alto, Médio, Baixo, Informativo)
3. Boas Práticas DevSecOps Aplicadas ou Recomendadas
4. Sugestões de Correção em Rust/Anchor com explicações técnicas de cibersegurança.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return res.json({ result: response.text });
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
