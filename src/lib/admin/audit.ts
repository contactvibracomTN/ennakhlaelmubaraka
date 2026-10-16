/**
 * Audit log — append-only JSONL under logs/admin-audit.jsonl.
 * Never throws: logging must never break an admin action.
 */
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { auditFile, logsDir } from "./paths";

export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
}

export function audit(actor: string, action: string, target: string, detail?: Record<string, unknown>): void {
  try {
    mkdirSync(logsDir(), { recursive: true });
    const entry: AuditEntry = { ts: new Date().toISOString(), actor, action, target, detail };
    appendFileSync(auditFile(), JSON.stringify(entry) + "\n", "utf8");
  } catch {
    /* ignore — audit must never fail the caller */
  }
}

export function readAudit(limit = 50): AuditEntry[] {
  try {
    const text = readFileSync(auditFile(), "utf8");
    const entries = text
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as AuditEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is AuditEntry => e !== null);
    return entries.slice(-limit).reverse();
  } catch {
    return [];
  }
}