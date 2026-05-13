import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    /** Replit runtime overlay is opt-in — Cursor/local preview often sets REPL_ID and would block the whole UI on any error. */
    ...(process.env.VITE_REPLIT_RUNTIME_OVERLAY === "1"
      ? [(await import("@replit/vite-plugin-runtime-error-modal")).default()]
      : []),
    /** Only enable on real Replit — Cursor/local often sets REPL_ID and breaks Vite middleware preview. */
    ...(process.env.VITE_REPLIT_CARTOGRAPHER === "1"
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    /** Single React resolution — avoids duplicate React in split chunks. */
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  /** Load `.env` from the repo root so one file serves Vite (`VITE_*`) and the server. */
  envDir: path.resolve(import.meta.dirname),
  /** Used by `npm run dev:client` (Vite only). Unified app uses Express + `setupVite` on PORT (default 3000). */
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    cssMinify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Keep React + DOM + scheduler + common React-only helpers in ONE chunk.
          // Splitting "misc" packages that import React (e.g. react-remove-scroll,
          // react-image-crop) into a separate chunk created a circular chunk graph:
          // vendor-react imported interop/helpers from vendor-misc while vendor-misc
          // imported React from vendor-react → undefined `useLayoutEffect` at runtime.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router") ||
            id.includes("/scheduler/") ||
            id.includes("/use-sync-external-store/") ||
            id.includes("/react-remove-scroll/") ||
            id.includes("/react-remove-scroll-bar/") ||
            id.includes("/react-style-singleton/") ||
            id.includes("/use-callback-ref/") ||
            id.includes("/use-sidecar/") ||
            id.includes("/react-image-crop/")
          ) {
            return "vendor-react";
          }

          if (id.includes("/@radix-ui/")) return "vendor-radix";
          if (id.includes("/@tanstack/")) return "vendor-query";
          if (id.includes("/@supabase/")) return "vendor-supabase";
          if (id.includes("/framer-motion/")) return "vendor-motion";
          if (id.includes("/lucide-react/")) return "vendor-icons";
          if (id.includes("/recharts/")) return "vendor-charts";
          if (
            id.includes("/socket.io-client/") ||
            id.includes("/socket.io-parser/") ||
            id.includes("/engine.io-client/") ||
            id.includes("/engine.io-parser/") ||
            id.includes("/engine.io/")
          ) {
            return "vendor-realtime";
          }
          if (id.includes("/@stripe/") || id.includes("/stripe/")) return "vendor-stripe";
          if (id.includes("/date-fns/")) return "vendor-date-fns";
          if (id.includes("/zod/")) return "vendor-zod";
          if (id.includes("/embla-carousel")) return "vendor-embla";
          if (id.includes("/react-spring/")) return "vendor-react-spring";
          if (id.includes("/heic2any/")) return "vendor-heic";
          if (id.includes("/uuid/")) return "vendor-uuid";
          if (id.includes("/jspdf/")) return "vendor-jspdf";
          if (id.includes("/html-to-image/")) return "vendor-html-to-image";
          if (id.includes("/react-hook-form/")) return "vendor-rhf";
          if (id.includes("/@hookform/resolvers/")) return "vendor-rhf-resolvers";
          if (id.includes("/cmdk/")) return "vendor-cmdk";
          if (id.includes("/zustand/")) return "vendor-zustand";
          if (id.includes("/react-day-picker/")) return "vendor-day-picker";
          if (id.includes("/vaul/")) return "vendor-vaul";
          if (id.includes("/@use-gesture/")) return "vendor-gesture";
          if (id.includes("/react-icons/")) return "vendor-react-icons";
          if (id.includes("/input-otp/")) return "vendor-input-otp";
          if (id.includes("/react-resizable-panels/")) return "vendor-panels";
          if (id.includes("/next-themes/")) return "vendor-themes";

          // Avoid a giant catch-all "vendor-misc" chunk: it shared Rollup interop/helpers
          // with vendor-react and created a circular chunk graph (React undefined at runtime:
          // "Cannot read properties of undefined (reading 'useLayoutEffect')").
          return undefined;
        },
      },
    },
  },
});
