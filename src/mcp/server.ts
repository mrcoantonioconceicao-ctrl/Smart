import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { auditRustContract } from "../utils/astAuditor.js";
import { deriveCounterPda, generateTxHash } from "../utils/solanaSimulator.js";
import {
  buildDependencyGraphFromCode,
  queryGraphVulnerabilities,
} from "../services/graphRAGService.js";

// Initialize the MCP Server instance
const mcpServer = new McpServer({
  name: "Solana Anchor DevSecOps Auditor & IDE MCP",
  version: "1.0.0",
});

/**
 * TOOL 1: audit_anchor_ast
 * Performs AST-based cybersecurity audit on Rust Anchor smart contract code.
 */
mcpServer.tool(
  "audit_anchor_ast",
  "Audita um contrato inteligente em Rust (Anchor framework) aplicando regras de cibersegurança AST (Program ID, PDA seeds, Signer check, has_one, space/rent allocation e checked arithmetic).",
  {
    code: z.string().describe("Código fonte Rust/Anchor do contrato inteligente a ser auditado."),
  },
  async ({ code }) => {
    try {
      const result = auditRustContract(code);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                summary: `Auditoria concluída com Pontuação DevSecOps: ${result.score}/100`,
                score: result.score,
                spaceCalculation: result.spaceCalc,
                findingsCount: result.findings.length,
                passedRulesCount: result.findings.filter((f) => f.isPassed).length,
                findings: result.findings.map((f) => ({
                  id: f.id,
                  title: f.title,
                  severity: f.severity,
                  category: f.category,
                  status: f.isPassed ? "APROVADO" : "VULNERÁVEL",
                  description: f.description,
                  recommendation: f.recommendation,
                })),
                astNodes: result.astNodes,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Erro ao executar auditoria AST: ${err.message || String(err)}`,
          },
        ],
      };
    }
  }
);

/**
 * TOOL 1B: analyze_graph_rag_dependencies
 * Builds a dependency graph (Nodes: PROGRAM/ACCOUNT/INSTRUCTION/SIGNER, Edges: MUTATES/CPI_CALLS)
 * and queries graph vulnerabilities for cross-instruction security risks.
 */
mcpServer.tool(
  "analyze_graph_rag_dependencies",
  "Mapeia as dependências de um contrato inteligente Anchor em um Grafo de Dependências (Nós: Programas/Contas/Instruções; Arestas: MUTATES, CPI_CALLS) e executa queryGraphVulnerabilities para análise de riscos cross-instruction.",
  {
    code: z.string().describe("Código fonte Rust/Anchor do contrato inteligente a ser analisado no grafo."),
  },
  async ({ code }) => {
    try {
      const graph = buildDependencyGraphFromCode(code);
      const report = queryGraphVulnerabilities(graph);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                summary: report.summary,
                riskScore: report.riskScore,
                totalNodes: report.totalNodes,
                totalEdges: report.totalEdges,
                findingsCount: report.findings.length,
                findings: report.findings,
                graphNodesSummary: graph.nodes.map((n) => ({
                  id: n.id,
                  label: n.label,
                  type: n.type,
                  properties: n.properties,
                })),
                graphEdgesSummary: graph.edges.map((e) => ({
                  id: e.id,
                  source: e.source,
                  target: e.target,
                  relationship: e.relationship,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Erro ao executar análise GraphRAG: ${err.message || String(err)}`,
          },
        ],
      };
    }
  }
);

/**
 * TOOL 2: derive_pda
 * Derives a deterministic Program Derived Address (PDA) and canonical bump.
 */
mcpServer.tool(
  "derive_pda",
  "Deriva o endereço de conta PDA (Program Derived Address) e o bump seed canônico para uma conta no cluster Solana.",
  {
    authorityPubkey: z.string().describe("Chave pública (Base58) da carteira autoridade/proprietária."),
    programId: z
      .string()
      .optional()
      .default("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")
      .describe("Program ID do contrato Anchor."),
    seed: z.string().optional().default("counter").describe("String de semente utilizada no cálculo do PDA."),
  },
  async ({ authorityPubkey, programId = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS", seed = "counter" }) => {
    try {
      const { pdaAddress, bump } = deriveCounterPda(authorityPubkey, programId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                authorityPubkey,
                programId,
                seed,
                pdaAddress,
                canonicalBump: bump,
                seedsFormat: `[b"${seed}", authority.key().as_ref()]`,
                rentExemptReserveSol: 0.0012384,
                accountSpaceBytes: 49,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Erro ao derivar PDA: ${err.message || String(err)}`,
          },
        ],
      };
    }
  }
);

/**
 * TOOL 3: simulate_svm_instruction
 * Simulates a Solana Virtual Machine (SVM) instruction on-chain.
 */
mcpServer.tool(
  "simulate_svm_instruction",
  "Simula a execução de uma instrução Solana (SVM) no runtime do Anchor (initialize, increment, decrement, reset).",
  {
    instruction: z
      .enum(["initialize", "increment", "decrement", "reset"])
      .describe("Nome da instrução a ser simulada no contrato Anchor."),
    authority: z
      .string()
      .optional()
      .default("7xKXtg2CW87d97TXJSDpbD5jBkP29zFJ2d1bYg8N41kR")
      .describe("Chave pública da autoridade que assina a transação."),
    pdaAddress: z.string().optional().describe("Endereço PDA da conta de estado. Se não fornecido, será derivado."),
    currentCount: z.number().optional().default(0).describe("Valor atual do contador no estado da conta."),
    bump: z.number().optional().default(254).describe("Bump seed da conta PDA."),
  },
  async ({ instruction, authority = "7xKXtg2CW87d97TXJSDpbD5jBkP29zFJ2d1bYg8N41kR", pdaAddress, currentCount = 0, bump = 254 }) => {
    try {
      const derived = pdaAddress ? { pdaAddress, bump } : deriveCounterPda(authority, "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
      const targetPda = derived.pdaAddress;
      const targetBump = derived.bump;

      const txHash = generateTxHash();
      const slot = Math.floor(280000000 + Math.random() * 500000);
      let newCount = currentCount;
      let logs: string[] = [];
      let computeUnits = 1250;

      switch (instruction) {
        case "initialize":
          newCount = 0;
          computeUnits = 8420;
          logs = [
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS invoke [1]`,
            `Program log: Instruction: Initialize`,
            `Program log: Initializing UserCounter PDA: ${targetPda} with bump ${targetBump}`,
            `Program log: Allocating 49 bytes rent-exempt account for authority ${authority.slice(0, 8)}...`,
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS success`,
          ];
          break;

        case "increment":
          newCount = currentCount + 1;
          computeUnits = 3120;
          logs = [
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS invoke [1]`,
            `Program log: Instruction: Increment`,
            `Program log: Validating Signer: ${authority.slice(0, 8)}...`,
            `Program log: Checked add: ${currentCount} -> ${newCount}`,
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS success`,
          ];
          break;

        case "decrement":
          if (currentCount <= 0) {
            throw new Error("Underflow: O contador não pode ser menor que zero (ErrorCode::Underflow)");
          }
          newCount = currentCount - 1;
          computeUnits = 3150;
          logs = [
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS invoke [1]`,
            `Program log: Instruction: Decrement`,
            `Program log: Validating Signer: ${authority.slice(0, 8)}...`,
            `Program log: Checked sub: ${currentCount} -> ${newCount}`,
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS success`,
          ];
          break;

        case "reset":
          newCount = 0;
          computeUnits = 2800;
          logs = [
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS invoke [1]`,
            `Program log: Instruction: Reset`,
            `Program log: Validating Signer authority: ${authority.slice(0, 8)}...`,
            `Program log: Resetting counter state to 0`,
            `Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS success`,
          ];
          break;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                instruction,
                txHash,
                slot,
                computeUnitsConsumed: computeUnits,
                previousCount: currentCount,
                newCount,
                authority,
                pdaAddress: targetPda,
                bump: targetBump,
                logs,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Erro ao simular instrução SVM (${instruction}): ${err.message || String(err)}`,
          },
        ],
      };
    }
  }
);

/**
 * TOOL 4: create_github_pr
 * Prepares and commits changes to a GitHub fork and provides PR links.
 */
mcpServer.tool(
  "create_github_pr",
  "Envia um commit com código alterado para o repositório fork no GitHub via GitHub REST API e gera link para criação de Pull Request.",
  {
    githubToken: z.string().describe("Token de Acesso Pessoal (PAT) ou OAuth do GitHub com permissão de escrita em repositórios."),
    owner: z.string().describe("Nome de usuário no GitHub onde o fork está localizado."),
    repo: z.string().optional().default("contratos-inteligentes").describe("Nome do repositório no GitHub."),
    branch: z.string().optional().default("main").describe("Branch de destino para o push do commit."),
    filePath: z
      .string()
      .optional()
      .default("programs/solana_sandbox_counter/src/lib.rs")
      .describe("Caminho do arquivo a ser criado/atualizado no repositório."),
    fileContent: z.string().describe("Conteúdo textual do arquivo a ser gravado."),
    commitMessage: z.string().describe("Mensagem do commit (seguindo padrão Conventional Commits)."),
    upstreamOwner: z
      .string()
      .optional()
      .default("mrcoantonioconceicao-ctrl")
      .describe("Proprietário do repositório oficial upstream."),
  },
  async ({
    githubToken,
    owner,
    repo = "contratos-inteligentes",
    branch = "main",
    filePath = "programs/solana_sandbox_counter/src/lib.rs",
    fileContent,
    commitMessage,
    upstreamOwner = "mrcoantonioconceicao-ctrl",
  }) => {
    try {
      // 1. Fetch branch ref to get latest commit SHA
      const refUrl = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`;
      const refRes = await fetch(refUrl, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-Anchor-DevSecOps-MCP",
        },
      });

      if (!refRes.ok) {
        const errText = await refRes.text();
        throw new Error(`Falha ao obter referência da branch ${branch} em ${owner}/${repo}: ${errText}`);
      }

      const refData: any = await refRes.json();
      const latestCommitSha = refData.object.sha;

      // 2. Get commit details for tree SHA
      const commitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`;
      const commitRes = await fetch(commitUrl, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-Anchor-DevSecOps-MCP",
        },
      });
      const commitData: any = await commitRes.json();
      const baseTreeSha = commitData.tree.sha;

      // 3. Create blob
      const createBlobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs`;
      const blobRes = await fetch(createBlobUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-Anchor-DevSecOps-MCP",
        },
        body: JSON.stringify({
          content: fileContent,
          encoding: "utf-8",
        }),
      });
      const blobData: any = await blobRes.json();

      // 4. Create new tree
      const createTreeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees`;
      const treeRes = await fetch(createTreeUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-Anchor-DevSecOps-MCP",
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: [
            {
              path: filePath,
              mode: "100644",
              type: "blob",
              sha: blobData.sha,
            },
          ],
        }),
      });
      const treeData: any = await treeRes.json();

      // 5. Create commit
      const createCommitUrl = `https://api.github.com/repos/${owner}/${repo}/git/commits`;
      const newCommitRes = await fetch(createCommitUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-Anchor-DevSecOps-MCP",
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      });
      const newCommitData: any = await newCommitRes.json();

      // 6. Update reference
      const updateRefUrl = `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`;
      await fetch(updateRefUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Solana-Anchor-DevSecOps-MCP",
        },
        body: JSON.stringify({
          sha: newCommitData.sha,
          force: false,
        }),
      });

      const commitSha = newCommitData.sha;
      const fileUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`;
      const pullRequestUrl = `https://github.com/${upstreamOwner}/${repo}/compare/main...${owner}:${repo}:${branch}`;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                repository: `${owner}/${repo}`,
                branch,
                filePath,
                commitMessage,
                commitSha,
                fileUrl,
                pullRequestUrl,
                message: `Commit ${commitSha.slice(0, 7)} gravado com sucesso em ${owner}/${repo}@${branch}.`,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Erro ao realizar push/PR no GitHub: ${err.message || String(err)}`,
          },
        ],
      };
    }
  }
);

// Start server listening on STDIO if invoked directly
export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error("Servidor MCP de Auditoria Solana Anchor iniciado via STDIO.");
}

// Auto-run if executed as a CLI script
if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  startMcpServer().catch((err) => {
    console.error("Falha ao iniciar Servidor MCP:", err);
    process.exit(1);
  });
}
