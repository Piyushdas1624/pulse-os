"use client";

import { useEffect } from "react";
import { usePulseStore } from "@/lib/store/usePulseStore";
import { readGovernorConfig } from "@/lib/ai/keyVault";

/**
 * Mounted once in the root layout. The store hard-initialises
 * provider_mode: "demo" and never looked at localStorage, so every refresh
 * threw away the user's choice. This puts it back.
 */
export default function GovernorHydrator() {
  const setAIConfiguration = usePulseStore((s) => s.setAIConfiguration);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cfg = await readGovernorConfig();
      if (!cfg || cancelled) return;
      setAIConfiguration({
        provider_mode: cfg.provider_mode,
        provider_type: cfg.provider_type,
        selected_model: cfg.selected_model,
        is_key_valid: cfg.is_key_valid,
        personal_api_key: cfg.personal_api_key,
        is_offline_fallback: cfg.provider_mode === "demo",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [setAIConfiguration]);

  return null;
}
