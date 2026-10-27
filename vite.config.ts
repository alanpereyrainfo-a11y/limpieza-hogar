import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const base = "/limpieza-hogar/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.svg",
        "icons/favicon-32.png",
        "icons/apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/maskable-192.png",
        "icons/maskable-512.png",
      ],
      manifest: {
        name: "Limpieza del hogar",
        short_name: "Limpieza",
        description: "Planificá y controlá la limpieza de tu casa, con Mapi el mapache.",
        lang: "es-AR",
        dir: "ltr",
        id: base,
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#07060f",
        theme_color: "#07060f",
        categories: ["lifestyle", "productivity"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,woff}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 4178,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4178,
    strictPort: true,
    allowedHosts: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
