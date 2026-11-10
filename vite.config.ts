import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/blacklace-echo/",

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    {
      name: "blacklace-public-sherlock-config",
      generateBundle() {
        const env = loadEnv(mode, process.cwd(), "VITE_");
        const endpoint = env.VITE_SHERLOCK_PUBLIC_FEED_URL || "";
        // Public endpoint only, never expose private keys or service tokens.
        this.emitFile({ type: "asset", fileName: "world-feed-config.js",
          source: "window.BLACKLACE_SHERLOCK_PUBLIC_FEED_URL = " + JSON.stringify(endpoint) + ";" });
      },
    },
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },

    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
