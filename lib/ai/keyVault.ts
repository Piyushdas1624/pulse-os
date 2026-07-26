/**
 * keyVault — AES-GCM storage for a personal provider key.
 *
 * HONEST LIMITATION, read this before you demo it:
 * the passphrase is baked into the client bundle. That makes this
 * OBFUSCATION, not secrecy. Anyone with access to the page can recover the
 * key. What it does buy you: the key is never sitting in localStorage in
 * plaintext, so a casual glance at devtools or a synced browser profile does
 * not hand it over. Real secrecy needs a server-side vault and a proxied
 * request. Do not claim otherwise on stage.
 */

const STORAGE_KEY = "pulseos.governor.v2";
const SALT = "pulseos-local-vault-v2";
const PASSPHRASE = "pulseos:client-obfuscation-only";

export interface StoredGovernorConfig {
  provider_mode: "demo" | "personal" | "env";
  provider_type: "gemini" | "openai" | "anthropic" | "openrouter";
  selected_model: string;
  is_key_valid: boolean;
  /** base64 iv + ciphertext, never plaintext */
  key_cipher?: string;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

const b64 = (b: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string) =>
  Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derive(): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(PASSPHRASE),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT), iterations: 120_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptKey(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive();
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  return `${b64(iv.buffer)}.${b64(ct)}`;
}

export async function decryptKey(cipher: string): Promise<string | null> {
  try {
    const [ivPart, ctPart] = cipher.split(".");
    if (!ivPart || !ctPart) return null;
    const key = await derive();
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: unb64(ivPart) },
      key,
      unb64(ctPart)
    );
    return dec.decode(pt);
  } catch {
    return null;
  }
}

/** Write-through. Call this from ANY surface that changes provider state. */
export async function persistGovernorConfig(
  cfg: StoredGovernorConfig & { personal_api_key?: string }
): Promise<void> {
  if (typeof window === "undefined") return;
  const { personal_api_key, ...rest } = cfg;
  const payload: StoredGovernorConfig = { ...rest };
  if (personal_api_key) payload.key_cipher = await encryptKey(personal_api_key);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function readGovernorConfig(): Promise<
  (StoredGovernorConfig & { personal_api_key?: string }) | null
> {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredGovernorConfig;
    const personal_api_key = parsed.key_cipher
      ? (await decryptKey(parsed.key_cipher)) ?? undefined
      : undefined;
    return { ...parsed, personal_api_key };
  } catch {
    return null;
  }
}

export function clearGovernorConfig() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
