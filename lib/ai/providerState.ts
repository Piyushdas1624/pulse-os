import { usePulseStore } from "@/lib/store/usePulseStore";
import type { GovernorState } from "@/lib/types/pulse";
import { persistGovernorConfig } from "./keyVault";

/**
 * THE FIX for the stuck "Demo Mode" pill.
 *
 * Root cause: AISettingsModal kept provider state in local React state and
 * wrote straight to localStorage. The Navbar reads `governor.provider_mode`
 * from the Zustand store. Two sources of truth, so the pill never moved.
 *
 * Rule from here on: nothing writes provider state directly. Everything goes
 * through this function, which updates the store AND persists in one shot.
 */
export async function applyProviderConfig(
  patch: Partial<GovernorState> & { personal_api_key?: string }
) {
  const store = usePulseStore.getState();
  store.setAIConfiguration(patch);

  const g = usePulseStore.getState().governor;
  await persistGovernorConfig({
    provider_mode: g.provider_mode,
    provider_type: g.provider_type,
    selected_model: g.selected_model,
    is_key_valid: !!g.is_key_valid,
    personal_api_key: g.personal_api_key,
  });
}

/** Single source of truth for "are we actually talking to a real model?" */
export function isLiveProvider(g: GovernorState): boolean {
  return (
    (g.provider_mode === "personal" && !!g.is_key_valid && !!g.personal_api_key) ||
    g.provider_mode === "env"
  );
}

export function activeModelLabel(g: GovernorState): string {
  return isLiveProvider(g) ? g.selected_model : "Deterministic (demo)";
}
