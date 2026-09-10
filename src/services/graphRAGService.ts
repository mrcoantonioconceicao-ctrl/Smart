import { AuditSeverity } from "../types";

export type NodeType = "PROGRAM" | "ACCOUNT" | "INSTRUCTION" | "SIGNER";
export type EdgeRelationship =
  | "MUTATES"
  | "CPI_CALLS"
  | "READS"
  | "REQUIRES_SIGNER"
  | "OWNED_BY"
  | "DERIVED_FROM";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  properties: {
    isMut?: boolean;
    isSigner?: boolean;
    isPda?: boolean;
    hasOneConstraint?: boolean;
    ownerProgram?: string;
    description?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: EdgeRelationship;
  properties?: {
    instructionName?: string;
    details?: string;
  };
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphVulnerabilityFinding {
  id: string;
  title: string;
  severity: AuditSeverity;
  category: "Cross-Instruction Risk" | "CPI Security" | "Access Control" | "PDA Isolation";
  description: string;
  affectedNodes: string[];
  affectedEdges: string[];
  recommendation: string;
}

export interface GraphVulnerabilityReport {
  summary: string;
  riskScore: number; // 0 to 100
  totalNodes: number;
  totalEdges: number;
  findings: GraphVulnerabilityFinding[];
  graph: DependencyGraph;
}

/**
 * Parses Rust Anchor smart contract source code and builds a dependency graph
 * with Nodes (Programs, Accounts, Instructions, Signers) and Edges (MUTATES, CPI_CALLS, etc.).
 */
export function buildDependencyGraphFromCode(rustCode: string): DependencyGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeMap = new Map<string, GraphNode>();

  const addNode = (node: GraphNode) => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
      nodes.push(node);
    }
  };

  const addEdge = (edge: GraphEdge) => {
    if (!edges.some((e) => e.id === edge.id)) {
      edges.push(edge);
    }
  };

  // 1. Detect Main Program Node
  const programMatch = rustCode.match(/#\[program\]\s*pub\s+mod\s+(\w+)/);
  const programName = programMatch ? programMatch[1] : "solana_anchor_program";
  const programNodeId = `PROGRAM:${programName}`;

  addNode({
    id: programNodeId,
    label: `Program: ${programName}`,
    type: "PROGRAM",
    properties: { description: "Anchor Smart Contract Module" },
  });

  // 2. Extract Instructions
  const instructionRegex = /pub\s+fn\s+(\w+)\s*\([^)]*\)\s*->\s*Result<[^>]+>/g;
  let instMatch: RegExpExecArray | null;
  const instructionNames: string[] = [];

  while ((instMatch = instructionRegex.exec(rustCode)) !== null) {
    const instName = instMatch[1];
    instructionNames.push(instName);
    const instNodeId = `INSTRUCTION:${instName}`;

    addNode({
      id: instNodeId,
      label: `Instruction: ${instName}()`,
      type: "INSTRUCTION",
      properties: { description: `Anchor Endpoint Handler: ${instName}` },
    });

    // Edge: Program contains/exposes Instruction
    addEdge({
      id: `EDGE:${programNodeId}-EXPOSES-${instNodeId}`,
      source: programNodeId,
      target: instNodeId,
      relationship: "READS",
      properties: { details: "Program exposes instruction endpoint" },
    });
  }

  // Fallback default instructions if empty
  if (instructionNames.length === 0) {
    ["initialize", "increment", "decrement", "reset"].forEach((instName) => {
      instructionNames.push(instName);
      const instNodeId = `INSTRUCTION:${instName}`;
      addNode({
        id: instNodeId,
        label: `Instruction: ${instName}()`,
        type: "INSTRUCTION",
        properties: { description: `Anchor Endpoint Handler: ${instName}` },
      });
    });
  }

  // 3. Extract Accounts and Account Context Structs
  const contextStructRegex = /#\[derive\(Accounts\)\][\s\S]*?pub\s+struct\s+(\w+)[\s\S]*?\{([\s\S]*?)\}/g;
  let structMatch: RegExpExecArray | null;

  while ((structMatch = contextStructRegex.exec(rustCode)) !== null) {
    const structName = structMatch[1];
    const structBody = structMatch[2];

    // Link struct to corresponding instruction
    const matchingInst = instructionNames.find(
      (inst) => structName.toLowerCase().includes(inst.toLowerCase()) || inst.toLowerCase().includes(structName.toLowerCase().replace("ctx", ""))
    ) || instructionNames[0];

    const instNodeId = `INSTRUCTION:${matchingInst}`;

    // Parse fields inside account context
    const fieldBlocks = structBody.split(/(?=#\[account|pub\s+\w+:)/g);

    for (const block of fieldBlocks) {
      if (!block.trim()) continue;

      const isMut = /#\[account\([^)]*mut[^)]*\)\]/.test(block) || /pub\s+mut\s+/.test(block);
      const isSigner = /Signer<'info>/.test(block) || /signer/.test(block);
      const isPda = /seeds\s*=/.test(block) || /bump/.test(block);
      const hasOne = /has_one\s*=/.test(block);

      const fieldNameMatch = block.match(/pub\s+(\w+):\s*([^\n,;]+)/);
      if (fieldNameMatch) {
        const accFieldName = fieldNameMatch[1];
        const accType = fieldNameMatch[2].trim();

        const accNodeId = `ACCOUNT:${accFieldName}`;
        const isSignerNode = accType.includes("Signer") || isSigner;

        addNode({
          id: accNodeId,
          label: `${isSignerNode ? "Signer" : "Account"}: ${accFieldName}`,
          type: isSignerNode ? "SIGNER" : "ACCOUNT",
          properties: {
            isMut,
            isSigner: isSignerNode,
            isPda,
            hasOneConstraint: hasOne,
            description: `Type: ${accType}`,
          },
        });

        // Add MUTATES or READS edge from Instruction to Account
        if (isMut) {
          addEdge({
            id: `EDGE:${instNodeId}-MUTATES-${accNodeId}`,
            source: instNodeId,
            target: accNodeId,
            relationship: "MUTATES",
            properties: { instructionName: matchingInst, details: "Modifies state of account" },
          });
        } else {
          addEdge({
            id: `EDGE:${instNodeId}-READS-${accNodeId}`,
            source: instNodeId,
            target: accNodeId,
            relationship: "READS",
            properties: { instructionName: matchingInst, details: "Reads state of account" },
          });
        }

        if (isSignerNode) {
          addEdge({
            id: `EDGE:${instNodeId}-REQUIRES_SIGNER-${accNodeId}`,
            source: instNodeId,
            target: accNodeId,
            relationship: "REQUIRES_SIGNER",
            properties: { instructionName: matchingInst, details: "Requires signature verification" },
          });
        }

        if (isPda) {
          addEdge({
            id: `EDGE:${accNodeId}-DERIVED_FROM-${programNodeId}`,
            source: accNodeId,
            target: programNodeId,
            relationship: "DERIVED_FROM",
            properties: { details: "PDA derived via program seeds & bump" },
          });
        }
      }
    }
  }

  // 4. Detect CPI Calls
  const cpiMatches = rustCode.match(/(cpi::|invoke\(|invoke_signed\(|token::transfer|system_program::transfer)/g);
  if (cpiMatches && cpiMatches.length > 0) {
    const extProgramId = "PROGRAM:ExternalSystemProgram";
    addNode({
      id: extProgramId,
      label: "External Program (CPI)",
      type: "PROGRAM",
      properties: { description: "Cross-Program Invocation Target" },
    });

    instructionNames.forEach((inst) => {
      if (rustCode.includes("invoke") || rustCode.includes("cpi")) {
        addEdge({
          id: `EDGE:INSTRUCTION:${inst}-CPI_CALLS-${extProgramId}`,
          source: `INSTRUCTION:${inst}`,
          target: extProgramId,
          relationship: "CPI_CALLS",
          properties: { instructionName: inst, details: "Cross-Program Invocation executed" },
        });
      }
    });
  }

  // Ensure default fallback accounts if context parsing found none
  if (nodes.filter((n) => n.type === "ACCOUNT" || n.type === "SIGNER").length === 0) {
    const userCounterNodeId = "ACCOUNT:user_counter";
    const authorityNodeId = "SIGNER:authority";

    addNode({
      id: userCounterNodeId,
      label: "Account: user_counter (PDA)",
      type: "ACCOUNT",
      properties: { isMut: true, isPda: true, hasOneConstraint: true },
    });

    addNode({
      id: authorityNodeId,
      label: "Signer: authority",
      type: "SIGNER",
      properties: { isSigner: true },
    });

    instructionNames.forEach((inst) => {
      addEdge({
        id: `EDGE:INSTRUCTION:${inst}-MUTATES-${userCounterNodeId}`,
        source: `INSTRUCTION:${inst}`,
        target: userCounterNodeId,
        relationship: "MUTATES",
        properties: { instructionName: inst },
      });

      addEdge({
        id: `EDGE:INSTRUCTION:${inst}-REQUIRES_SIGNER-${authorityNodeId}`,
        source: `INSTRUCTION:${inst}`,
        target: authorityNodeId,
        relationship: "REQUIRES_SIGNER",
        properties: { instructionName: inst },
      });
    });
  }

  return { nodes, edges };
}

/**
 * Queries the dependency graph to analyze cross-instruction and cross-account vulnerability risks.
 * Evaluates MUTATES, CPI_CALLS, PDA isolation, and missing signer constraints.
 */
export function queryGraphVulnerabilities(graph: DependencyGraph): GraphVulnerabilityReport {
  const findings: GraphVulnerabilityFinding[] = [];
  const nodes = graph.nodes;
  const edges = graph.edges;

  const mutatesEdges = edges.filter((e) => e.relationship === "MUTATES");
  const cpiEdges = edges.filter((e) => e.relationship === "CPI_CALLS");
  const signerEdges = edges.filter((e) => e.relationship === "REQUIRES_SIGNER");

  // 1. Cross-Instruction Unprotected State Mutation (MUTATES without REQUIRES_SIGNER)
  const mutativeInstructions = new Set(mutatesEdges.map((e) => e.source));

  mutativeInstructions.forEach((instId) => {
    const instName = instId.replace("INSTRUCTION:", "");
    const hasSigner = signerEdges.some((e) => e.source === instId);

    if (!hasSigner) {
      const affectedMutEdges = mutatesEdges.filter((e) => e.source === instId);
      const affectedAccountIds = affectedMutEdges.map((e) => e.target);

      findings.push({
        id: `GRAPH-VULN-01-${instName}`,
        title: `Instrução '${instName}' altera estado sem exigência de Signer`,
        severity: "HIGH",
        category: "Access Control",
        description: `A instrução '${instName}' possui arestas de mutação (MUTATES) em contas de estado, mas não requer nenhuma conta do tipo Signer no seu contexto de execução graph.`,
        affectedNodes: [instId, ...affectedAccountIds],
        affectedEdges: affectedMutEdges.map((e) => e.id),
        recommendation: `Adicione a restrição Signer<'info> para a autoridade no struct de contas associado a '${instName}'.`,
      });
    }
  });

  // 2. Cross-Instruction Shared Mutable State Race Condition
  // Checks if multiple instructions mutate the exact same account node
  const accountMutatorsMap = new Map<string, string[]>();

  mutatesEdges.forEach((e) => {
    const accId = e.target;
    const instId = e.source;
    const list = accountMutatorsMap.get(accId) || [];
    if (!list.includes(instId)) {
      list.push(instId);
      accountMutatorsMap.set(accId, list);
    }
  });

  accountMutatorsMap.forEach((instList, accId) => {
    if (instList.length > 1) {
      const accNode = nodes.find((n) => n.id === accId);
      const accName = accNode ? accNode.label : accId;

      // Check if any inst lacks has_one or pda check
      const missingConstraints = instList.filter((instId) => {
        const instSigners = signerEdges.filter((e) => e.source === instId);
        return instSigners.length === 0;
      });

      if (missingConstraints.length > 0) {
        findings.push({
          id: `GRAPH-VULN-02-${accId.replace("ACCOUNT:", "")}`,
          title: `Risco Cross-Instruction em '${accName}'`,
          severity: "HIGH",
          category: "Cross-Instruction Risk",
          description: `A conta '${accName}' é modificada por múltiplas instruções (${instList.map((i) => i.replace("INSTRUCTION:", "")).join(", ")}), porém a instrução '${missingConstraints[0].replace("INSTRUCTION:", "")}' não aplica verificações de autoridade consistentes.`,
          affectedNodes: [accId, ...instList],
          affectedEdges: mutatesEdges.filter((e) => e.target === accId).map((e) => e.id),
          recommendation: `Garanta que todas as instruções que mutam '${accName}' possuam as restrições #[account(mut, has_one = authority)] e autoridade Signer.`,
        });
      }
    }
  });

  // 3. Unchecked Cross-Program Invocation (CPI_CALLS) Risk
  cpiEdges.forEach((cpiEdge) => {
    const instId = cpiEdge.source;
    const targetProgramId = cpiEdge.target;
    const instName = instId.replace("INSTRUCTION:", "");

    // Check if CPI happens in an instruction that also mutates local state
    const mutatesInSameInst = mutatesEdges.filter((e) => e.source === instId);

    if (mutatesInSameInst.length > 0) {
      findings.push({
        id: `GRAPH-VULN-03-${instName}`,
        title: `Risco de Reentrância/CPI Não Verificada na instrução '${instName}'`,
        severity: "MEDIUM",
        category: "CPI Security",
        description: `A instrução '${instName}' realiza invocações cruzadas (CPI_CALLS) em programas externos ao mesmo tempo em que muta contas de estado locais. É necessário verificar o Program ID externo para evitar sequestro de chamadas.`,
        affectedNodes: [instId, targetProgramId, ...mutatesInSameInst.map((e) => e.target)],
        affectedEdges: [cpiEdge.id, ...mutatesInSameInst.map((e) => e.id)],
        recommendation: `Valide o Program ID do programa invocado usando Program<'info, System> ou constraint address = ... e aplique o padrão Checks-Effects-Interactions.`,
      });
    }
  });

  // 4. PDA Seed Isolation Verification
  const pdaNodes = nodes.filter((n) => n.properties.isPda);
  pdaNodes.forEach((pdaNode) => {
    const pdaMutations = mutatesEdges.filter((e) => e.target === pdaNode.id);
    const hasHasOne = pdaNode.properties.hasOneConstraint;

    if (pdaMutations.length > 0 && !hasHasOne) {
      findings.push({
        id: `GRAPH-VULN-04-${pdaNode.id.replace("ACCOUNT:", "")}`,
        title: `PDA '${pdaNode.label}' sem validação de autoridade (has_one)`,
        severity: "HIGH",
        category: "PDA Isolation",
        description: `A conta PDA '${pdaNode.label}' sofre mutação por instruções, mas a estrutura do grafo indica ausência da restrição 'has_one = authority' no contrato Anchor.`,
        affectedNodes: [pdaNode.id, ...pdaMutations.map((e) => e.source)],
        affectedEdges: pdaMutations.map((e) => e.id),
        recommendation: `Defina #[account(mut, seeds = [b"counter", authority.key().as_ref()], bump = counter.bump, has_one = authority)] para impedir mutação não autorizada de PDAs de terceiros.`,
      });
    }
  });

  // Calculate overall risk score
  let totalDeduction = 0;
  findings.forEach((f) => {
    if (f.severity === "CRITICAL") totalDeduction += 30;
    else if (f.severity === "HIGH") totalDeduction += 15;
    else if (f.severity === "MEDIUM") totalDeduction += 8;
    else if (f.severity === "LOW") totalDeduction += 3;
  });

  const riskScore = Math.max(0, 100 - totalDeduction);

  const summary =
    findings.length === 0
      ? "Nenhuma vulnerabilidade cross-instruction detectada no grafo de dependências."
      : `Detectadas ${findings.length} vulnerabilidade(s) no grafo de dependências com Pontuação de Segurança ${riskScore}/100.`;

  return {
    summary,
    riskScore,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    findings,
    graph,
  };
}
