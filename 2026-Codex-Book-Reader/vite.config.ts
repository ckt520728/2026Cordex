import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "墨頁 Book Reader",
        short_name: "墨頁",
        description: "可離線使用的個人電子書閱讀器",
        display: "standalone",
        start_url: ".",
        scope: ".",
        background_color: "#f4efe5",
        theme_color: "#7a4b32",
        lang: "zh-Hant",
        orientation: "any",
        icons: [
          {
            src: "icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,mjs,css,html,svg,woff2}"]
      }
    })
  ],
  // PDF worker 以 ES module 形式輸出，才能在 worker 內先載入 polyfill 再載入 PDF.js。
  worker: { format: "es" },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true
  }
});
