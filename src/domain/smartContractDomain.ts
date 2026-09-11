/**
 * DOMAIN-DRIVEN DESIGN (DDD) - SMART CONTRACT DOMAIN
 * Contains Value Objects, Entities, Domain Invariants, and Aggregates.
 */

// --- VALUE OBJECTS ---

export class ProgramAddress {
  private readonly address: string;

  constructor(address: string) {
    if (!address || address.trim().length === 0) {
      throw new Error("ProgramAddress cannot be empty.");
    }
    // Basic Base58 or Solana pubkey length check (32-44 chars)
    const trimmed = address.trim();
    if (trimmed.length < 32 || trimmed.length > 44) {
      throw new Error(`Invalid Solana ProgramAddress length: ${trimmed.length} chars. Expected 32-44.`);
    }
    this.address = trimmed;
  }

  public getValue(): string {
    return this.address;
  }

  public isDefaultPlaceholder(): boolean {
    return (
      this.address === "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS" ||
      this.address.startsWith("11111111")
    );
  }

  public equals(other: ProgramAddress): boolean {
    return this.address === other.getValue();
  }
}

export class PdaSeed {
  private readonly name: string;
  private readonly value: string;

  constructor(name: string, value: string) {
    if (!name.trim()) throw new Error("PdaSeed name cannot be empty.");
    this.name = name.trim();
    this.value = value.trim();
  }

  public getName(): string {
    return this.name;
  }

  public getValue(): string {
    return this.value;
  }

  public toRustSeedExpr(): string {
    if (this.name === "literal") {
      return `b"${this.value}"`;
    }
    return `${this.value}.key().as_ref()`;
  }
}

export class AccountSpace {
  public readonly discriminatorBytes: number = 8;
  public readonly pubkeyBytes: number = 32;
  public readonly u64CountBytes: number = 8;
  public readonly bumpBytes: number = 1;

  public getTotalBytes(): number {
    return (
      this.discriminatorBytes +
      this.pubkeyBytes +
      this.u64CountBytes +
      this.bumpBytes
    );
  }

  public calculateRentExemptLamports(): number {
    // Solana rent formula approximation: (space + 128) * 6960 lamports
    const bytes = this.getTotalBytes();
    return (bytes + 128) * 6960;
  }

  public calculateRentExemptSol(): number {
    return Number((this.calculateRentExemptLamports() / 1e9).toFixed(7));
  }
}

// --- DOMAIN ENTITIES & AGGREGATES ---

export interface AstNodeEntity {
  id: string;
  type: "PROGRAM" | "ACCOUNT_CONTEXT" | "INSTRUCTION" | "CONSTRAINT";
  name: string;
  sourceLine?: number;
  securityAttributes: string[];
}

export class SmartContractAuditAggregate {
  private readonly id: string;
  private readonly sourceCode: string;
  private score: number;
  private findings: Array<{
    id: string;
    title: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "PASS";
    isPassed: boolean;
    description: string;
    recommendation: string;
  }>;

  constructor(id: string, sourceCode: string) {
    if (!sourceCode) throw new Error("Source code is required for audit aggregate.");
    this.id = id;
    this.sourceCode = sourceCode;
    this.score = 100;
    this.findings = [];
  }

  public getId(): string {
    return this.id;
  }

  public getSourceCode(): string {
    return this.sourceCode;
  }

  public getScore(): number {
    return this.score;
  }

  public getFindings() {
    return [...this.findings];
  }

  public addFinding(finding: {
    id: string;
    title: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "PASS";
    isPassed: boolean;
    description: string;
    recommendation: string;
  }): void {
    this.findings.push(finding);
    if (!finding.isPassed) {
      if (finding.severity === "CRITICAL") this.score -= 25;
      else if (finding.severity === "HIGH") this.score -= 15;
      else if (finding.severity === "MEDIUM") this.score -= 10;
      else if (finding.severity === "LOW") this.score -= 5;
      this.score = Math.max(0, this.score);
    }
  }

  public isSecure(): boolean {
    return this.score >= 80 && !this.findings.some((f) => !f.isPassed && f.severity === "CRITICAL");
  }
}

// --- DOMAIN SERVICE ---

export class SmartContractDomainService {
  /**
   * Validates invariants on smart contract AST structures according to DDD rules.
   */
  public static validateAccountSpaceInvariant(requestedSpace: number, calculatedSpace: number): boolean {
    return requestedSpace >= calculatedSpace;
  }

  public static validateSignerConstraintPresence(code: string): boolean {
    return /Signer<'info>/.test(code) || /Signer/.test(code);
  }

  public static validateCanonicalPdaPattern(code: string): boolean {
    return /seeds\s*=/.test(code) && /bump/.test(code);
  }
}
