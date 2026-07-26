# Patching AISettingsModal.tsx

You do not need to rewrite it. You need to stop it keeping a private copy of
provider state.

## 1. Delete the local state

```diff
- const [providerMode, setProviderMode] = useState<AIProviderMode>("demo");
- const [apiKey, setApiKey] = useState("");
- const [isKeyValid, setIsKeyValid] = useState(false);
+ const governor = usePulseStore((s) => s.governor);
+ const [draftKey, setDraftKey] = useState(""); // draft only, never the source of truth
```

Everywhere the component read `providerMode`, read `governor.provider_mode`.
Everywhere it read `isKeyValid`, read `governor.is_key_valid`.

## 2. Replace every write

```diff
- setProviderMode("personal");
- localStorage.setItem("pulse_provider_mode", "personal");
+ await applyProviderConfig({ provider_mode: "personal" });
```

```diff
- setIsKeyValid(true);
- localStorage.setItem("pulse_api_key", apiKey);
+ await applyProviderConfig({
+   provider_mode: "personal",
+   personal_api_key: draftKey.trim(),
+   is_key_valid: true,
+   validation_error: undefined,
+   is_offline_fallback: false,
+ });
```

Import it from `@/lib/ai/providerState`.

## 3. Kill the hardcoded chat replies

In `app/ai-ops/page.tsx` the console fakes answers with `setTimeout`. Gate on
the store instead:

```ts
import { isLiveProvider } from "@/lib/ai/providerState";

const governor = usePulseStore((s) => s.governor);

async function ask(q: string) {
  if (!isLiveProvider(governor)) {
    return deterministicAnswer(q, usePulseStore.getState()); // grounded on real store numbers
  }
  const res = await fetch("/api/ai/health-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: q, model: governor.selected_model }),
  });
  return (await res.json()).text;
}
```

Demo mode should still answer, just deterministically and from real numbers. The
sin was answering with canned text while a valid key sat right there.

## 4. Optional: make the modal a launcher

Settings is now a page. If you want to keep the modal entry point, have it push
to `/settings` rather than duplicating the form.
