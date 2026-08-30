export type AuditSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | "PASS";

export interface SecurityFinding {
  id: string;
  title: string;
  severity: AuditSeverity;
  category: "PDA Validation" | "Access Control" | "Arithmetic Safety" | "Account Space" | "CPI Security" | "DevSecOps CI/CD";
  description: string;
  line?: number;
  recommendation: string;
  codeSnippet?: string;
  fixedSnippet?: string;
  isPassed: boolean;
}

export interface AstNode {
  type: string;
  name: string;
  details: string;
  children?: AstNode[];
  securityNote?: string;
}

export interface AccountSpaceCalculation {
  discriminator: number;
  pubkeySize: number;
  u64CountSize: number;
  bumpSize: number;
  totalBytes: number;
  rentLamportsEstimate: number;
}

export interface SolanaWallet {
  publicKey: string;
  secretKeyDisplay: string;
  balanceSol: number;
  isConnected: boolean;
}

export interface OnChainCounterAccount {
  isInitialized: boolean;
  pdaAddress: string;
  authority: string;
  count: number;
  bump: number;
  rentExemptReserveSol: number;
  dataLengthBytes: number;
}

export interface TransactionLog {
  id: string;
  timestamp: string;
  signature: string;
  instruction: string;
  status: "SUCCESS" | "FAILED";
  slot: number;
  computeUnitsUsed: number;
  accountsInvolved: { name: string; pubkey: string; isSigner: boolean; isWritable: boolean }[];
  logs: string[];
}

export interface PipelineStep {
  id: string;
  name: string;
  command: string;
  status: "idle" | "running" | "passed" | "failed";
  durationMs?: number;
  output: string[];
}

export type ActiveTab = "editor" | "audit" | "simulator" | "pipeline";

export interface AnchorIdlAccountField {
  name: string;
  type: string;
}

export interface AnchorIdlInstruction {
  name: string;
  accounts: {
    name: string;
    isMut: boolean;
    isSigner: boolean;
    pda?: {
      seeds: string[];
    };
  }[];
  args: any[];
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  html_url: string;
  bio?: string;
  public_repos?: number;
}

export interface GitHubForkInfo {
  exists: boolean;
  fullName?: string;
  htmlUrl?: string;
  defaultBranch?: string;
  isFork?: boolean;
  parentRepo?: string | null;
  stars?: number;
  updatedAt?: string;
}

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  fileUrl?: string;
  branch?: string;
  repo?: string;
  filePath?: string;
  error?: string;
}

export interface AnchorIdl {
  version: string;
  name: string;
  instructions: AnchorIdlInstruction[];
  accounts: {
    name: string;
    type: {
      kind: string;
      fields: AnchorIdlAccountField[];
    };
  }[];
  metadata: {
    address: string;
  };
}
