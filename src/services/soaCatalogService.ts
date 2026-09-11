/**
 * SERVICE-ORIENTED ARCHITECTURE (SOA) CATALOG & REGISTRY SERVICE
 * Defines service interfaces, contracts, health checks, and service-oriented routing.
 */

export interface SoaServiceContract {
  serviceId: string;
  name: string;
  version: string;
  type: "CORE_DOMAIN" | "INFRASTRUCTURE" | "INTEGRATION" | "WORKFLOW";
  endpoint: string;
  protocol: "REST" | "MCP_STDIO" | "IN_MEMORY";
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  methods: Array<{
    name: string;
    description: string;
    inputSchema: string;
    outputSchema: string;
  }>;
}

export class SoaCatalogRegistry {
  private static instance: SoaCatalogRegistry;
  private readonly servicesMap: Map<string, SoaServiceContract>;

  private constructor() {
    this.servicesMap = new Map<string, SoaServiceContract>();
    this.registerDefaultServices();
  }

  public static getInstance(): SoaCatalogRegistry {
    if (!SoaCatalogRegistry.instance) {
      SoaCatalogRegistry.instance = new SoaCatalogRegistry();
    }
    return SoaCatalogRegistry.instance;
  }

  private registerDefaultServices(): void {
    // 1. AST Auditor Service
    this.servicesMap.set("AstAuditorService", {
      serviceId: "srv-ast-auditor-v1",
      name: "AST Smart Contract Auditor Service",
      version: "1.0.0",
      type: "CORE_DOMAIN",
      endpoint: "in-memory://astAuditor",
      protocol: "IN_MEMORY",
      status: "ONLINE",
      methods: [
        {
          name: "auditRustContract",
          description: "Inspeção estática AST e validação de regras Anchor.",
          inputSchema: "{ code: string }",
          outputSchema: "{ score: number, findings: Finding[], spaceCalc: Space }",
        },
      ],
    });

    // 2. GraphRAG Service
    this.servicesMap.set("GraphRAGService", {
      serviceId: "srv-graph-rag-v1",
      name: "GraphRAG Dependency Mapping & Cross-Instruction Service",
      version: "1.0.0",
      type: "CORE_DOMAIN",
      endpoint: "in-memory://graphRAGService",
      protocol: "IN_MEMORY",
      status: "ONLINE",
      methods: [
        {
          name: "buildDependencyGraphFromCode",
          description: "Mapeia código em Grafo de Nós (Programas/Contas) e Arestas (MUTATES/CPI).",
          inputSchema: "{ code: string }",
          outputSchema: "DependencyGraph",
        },
        {
          name: "queryGraphVulnerabilities",
          description: "Avalia vulnerabilidades no grafo de dependências.",
          inputSchema: "DependencyGraph",
          outputSchema: "GraphVulnerabilityReport",
        },
      ],
    });

    // 3. Solana SVM Simulator Service
    this.servicesMap.set("SolanaSimulatorService", {
      serviceId: "srv-svm-simulator-v1",
      name: "Solana Virtual Machine (SVM) Instruction Simulation Service",
      version: "1.0.0",
      type: "CORE_DOMAIN",
      endpoint: "in-memory://solanaSimulator",
      protocol: "IN_MEMORY",
      status: "ONLINE",
      methods: [
        {
          name: "deriveCounterPda",
          description: "Derivação determinística de PDA e bump seed.",
          inputSchema: "{ authorityPubkey: string, programId?: string }",
          outputSchema: "{ pdaAddress: string, bump: number }",
        },
      ],
    });

    // 4. MCP Protocol Transport Service
    this.servicesMap.set("McpProtocolService", {
      serviceId: "srv-mcp-protocol-v1",
      name: "Model Context Protocol (MCP) Server Service",
      version: "1.0.0",
      type: "INTEGRATION",
      endpoint: "/api/mcp/info",
      protocol: "MCP_STDIO",
      status: "ONLINE",
      methods: [
        {
          name: "audit_anchor_ast",
          description: "Auditoria AST exposta para LLMs via MCP.",
          inputSchema: "{ code: string }",
          outputSchema: "MCPTextResult",
        },
        {
          name: "analyze_graph_rag_dependencies",
          description: "Análise de Grafo RAG exposta via MCP.",
          inputSchema: "{ code: string }",
          outputSchema: "MCPTextResult",
        },
        {
          name: "create_github_pr",
          description: "Commit e Pull Request via MCP.",
          inputSchema: "{ githubToken: string, code: string, message: string }",
          outputSchema: "MCPTextResult",
        },
      ],
    });

    // 5. GitHub REST Integration Service
    this.servicesMap.set("GitHubSyncService", {
      serviceId: "srv-github-sync-v1",
      name: "GitHub REST API Sync & Fork Management Service",
      version: "1.0.0",
      type: "INTEGRATION",
      endpoint: "/api/github/*",
      protocol: "REST",
      status: "ONLINE",
      methods: [
        {
          name: "commitAndPushFiles",
          description: "Criação de commits e branches no repositório fork do GitHub.",
          inputSchema: "{ token: string, files: FileChange[] }",
          outputSchema: "GitHubPushResult",
        },
      ],
    });

    // 6. Gemini AI Review Service
    this.servicesMap.set("GeminiAiService", {
      serviceId: "srv-gemini-ai-v1",
      name: "Gemini AI Heuristic Code Audit Proxy Service",
      version: "2.5.0",
      type: "INFRASTRUCTURE",
      endpoint: "/api/ai-analyze",
      protocol: "REST",
      status: "ONLINE",
      methods: [
        {
          name: "analyzeWithGemini",
          description: "Auditoria por Inteligência Artificial no backend Express.",
          inputSchema: "{ code: string, prompt?: string }",
          outputSchema: "{ result: string }",
        },
      ],
    });

    // 7. BPMN DevSecOps Engine Service
    this.servicesMap.set("BpmnWorkflowService", {
      serviceId: "srv-bpmn-engine-v1",
      name: "BPMN 2.0 DevSecOps Pipeline Execution Service",
      version: "1.0.0",
      type: "WORKFLOW",
      endpoint: "in-memory://bpmnWorkflowService",
      protocol: "IN_MEMORY",
      status: "ONLINE",
      methods: [
        {
          name: "executeWorkflow",
          description: "Execução orientada a processos BPMN 2.0.",
          inputSchema: "{ initialCode: string }",
          outputSchema: "BpmnProcessExecutionState",
        },
      ],
    });
  }

  public getAllServices(): SoaServiceContract[] {
    return Array.from(this.servicesMap.values());
  }

  public getService(serviceName: string): SoaServiceContract | undefined {
    return this.servicesMap.get(serviceName);
  }

  public checkHealth(): Record<string, "ONLINE" | "DEGRADED" | "OFFLINE"> {
    const healthReport: Record<string, "ONLINE" | "DEGRADED" | "OFFLINE"> = {};
    this.servicesMap.forEach((service, key) => {
      healthReport[key] = service.status;
    });
    return healthReport;
  }
}
