/**
 * Client-safe path utilities for message trees and datasets.
 * A path is a dotted/braced string: "home.hero.title", "faq.items", "weightOptions[0].label".
 */

export function leafPaths(node: unknown, prefix = "", acc: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((child, idx) => leafPaths(child, `${prefix}[${idx}]`, acc));
    return acc;
  }
  if (typeof node === "object" && node !== null) {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") acc.push(p);
      else leafPaths(v, p, acc);
    }
  }
  return acc;
}

/** Collect every leaf string path (values are not returned — use getAtPath). */
export function stringLeafPaths(node: unknown): string[] {
  return leafPaths(node);
}

export function getAtPath(root: unknown, path: string): unknown {
  const parts = path.split(/[\.\[\]]+/).filter(Boolean);
  let node: unknown = root;
  for (const part of parts) {
    if (Array.isArray(node)) {
      const idx = /^\d+$/.test(part) ? Number(part) : -1;
      if (idx < 0) return undefined;
      node = node[idx];
    } else if (typeof node === "object" && node !== null && part in (node as object)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return node;
}

export function setAtPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(/[\.\[\]]+/).filter(Boolean);
  if (parts.length === 0) return;
  let node: Record<string, unknown> = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextIsIndex = /^\d+$/.test(parts[i + 1] ?? "");
    if (nextIsIndex) {
      const arr = (node[part] ??= []) as unknown[];
      const idx = Number(parts[i + 1]);
      const child: unknown = arr[idx] ?? {};
      arr[idx] = child;
      node = child as Record<string, unknown>;
      i += 1; // consume the index part
    } else {
      const child = (node[part] ??= {}) as Record<string, unknown>;
      node = child;
    }
  }
  node[parts[parts.length - 1]] = value;
}

export function deleteAtPath(root: Record<string, unknown>, path: string): void {
  const parts = path.split(/[\.\[\]]+/).filter(Boolean);
  if (parts.length === 0) return;
  let node: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    if (Array.isArray(node)) {
      const idx = /^\d+$/.test(parts[i]) ? Number(parts[i]) : -1;
      if (idx < 0) return;
      node = node[idx];
    } else if (typeof node === "object" && node !== null) {
      node = (node as Record<string, unknown>)[parts[i]];
    } else {
      return;
    }
  }
  if (typeof node === "object" && node !== null) {
    delete (node as Record<string, unknown>)[parts[parts.length - 1]];
  }
}