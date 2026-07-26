# PulseOS live AI overhaul

This is a focused patch pack for the latest `main` snapshot.

## What it fixes

- Real provider selection for Gemini, OpenAI, Anthropic and OpenRouter.
- Real key validation through each provider's models endpoint.
- Live model discovery from the validated key, not a hard-coded comparison table.
- Gemini 3.6 Flash is preferred when the account actually exposes it. If not, the UI selects the provider's recommended live model instead of lying.
- Real playground generation through each provider's native API shape.
- One compact settings surface. Use `AISettingsPanel` on the AI advisor page and link the dedicated `/settings` page to the same controls, or remove the duplicate launcher entirely.
- Explicit demo state. No fake live response, no fake latency, no fake today spend.

## Integration

1. Replace `lib/ai/governor.ts` with the provider logic in `lib/ai/providers.ts`, or import the new helpers from your existing governor.
2. Replace `app/api/ai/health-scan/route.ts` with the route in this pack.
3. Import `<AISettingsPanel />` from `components/AISettingsPanel.tsx` into `app/ai-ops/page.tsx`, replacing the old `AISettingsModal` launcher and duplicated tabs.
4. Keep the existing `applyProviderConfig` and `GovernorHydrator` from the previous pack. They are required for the navbar pill and refresh persistence.
5. Update the provider model type if you want to add streaming or tool-call metadata later. Do not add it until the product needs it.

## Important limitation

A browser-side personal key cannot be genuinely secret. The existing encrypted local storage is obfuscation only. For a production product, proxy calls through a server-side vault. This patch keeps requests server-side in the Next route, but the key still originates in the browser.

## Verification

I could not run `npm run build`, lint or Playwright against the remote repo from this workspace because the GitHub integration exposes the repository for reading but not a local checkout or write runner. Run:

```bash
npm install
npx tsc --noEmit
npm run lint
npm run build
```
