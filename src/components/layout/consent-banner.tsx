import { isConsentRequired } from "@/lib/config/features";

/**
 * Consent banner (Blueprint §30). Hidden until real analytics identifiers are
 * configured — script tags must not load without explicit consent.
 * Phase 0 shell: renders nothing; client logic lands with analytics wiring.
 */
export function ConsentBanner() {
  if (!isConsentRequired) {
    return null;
  }

  return null; // TODO(consent): implement once analytics IDs exist (v2 gate).
}
