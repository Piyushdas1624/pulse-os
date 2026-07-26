import type { Config } from "tailwindcss";

/**
 * PulseOS design tokens.
 *
 * The old `obsidian.*` and `pulse.*` keys are KEPT ON PURPOSE so that any
 * component you have not migrated yet keeps compiling. They now point at the
 * restrained palette, so untouched files inherit the new theme for free.
 *
 * Palette rationale: warm-neutral dark (umber-tinted), not the default
 * blue-black every AI dashboard ships with. Colour is reserved for meaning:
 * table state, stock risk, kitchen status. Nothing is coloured for decoration.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* --- surfaces: same hue + chroma, lightness carries elevation --- */
        obsidian: {
          950: "oklch(13.5% 0.006 68)",
          900: "oklch(15.5% 0.007 68)", // page background
          850: "oklch(19.0% 0.008 68)", // card
          800: "oklch(22.5% 0.009 68)", // raised
          700: "oklch(26.5% 0.010 68)", // control
        },
        line: {
          soft: "oklch(23.5% 0.009 68)",
          DEFAULT: "oklch(28.0% 0.010 68)",
          loud: "oklch(38.0% 0.013 68)",
        },
        ink: {
          DEFAULT: "oklch(96% 0.005 78)",
          muted: "oklch(75% 0.011 72)",
          subtle: "oklch(58% 0.012 72)",
        },
        /* --- semantic. each one encodes a state, never a mood --- */
        state: {
          ok: "oklch(76% 0.125 156)",
          okDim: "oklch(30% 0.055 156)",
          busy: "oklch(80% 0.130 74)",
          busyDim: "oklch(31% 0.058 74)",
          risk: "oklch(69% 0.165 26)",
          riskDim: "oklch(30% 0.075 26)",
          calm: "oklch(76% 0.095 232)",
          calmDim: "oklch(30% 0.048 232)",
          think: "oklch(74% 0.110 302)",
          thinkDim: "oklch(29% 0.055 302)",
        },
        /* --- legacy aliases, repointed. do not add new usages --- */
        pulse: {
          emerald: "oklch(76% 0.125 156)",
          cyan: "oklch(76% 0.095 232)",
          amber: "oklch(80% 0.130 74)",
          rose: "oklch(69% 0.165 26)",
          violet: "oklch(74% 0.110 302)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        /* font-mono is intentionally mapped to the sans stack: the old build
           used monospace as decoration. Use `tabular-nums` for aligned digits. */
        mono: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: { sm: "6px", DEFAULT: "10px", lg: "14px", xl: "20px" },
      boxShadow: {
        /* glow tokens neutered rather than deleted, so legacy classes
           stop glowing without breaking the build */
        glow: "none",
        "glow-emerald": "none",
        "glow-amber": "none",
        "glow-rose": "none",
        glass: "none",
        raise: "0 12px 32px -12px oklch(0% 0 0 / 0.7)",
      },
      backgroundImage: {
        "glass-gradient": "none",
        "glass-card": "none",
        "ai-glow": "none",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      animation: {
        pulse: "none",
        "radar-sweep": "none",
        "fade-in": "fadeIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards",
        sweep: "sweep 1.15s cubic-bezier(0.25,1,0.5,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        sweep: { "100%": { transform: "translateX(100%)" } },
      },
    },
  },
  plugins: [],
};

export default config;
