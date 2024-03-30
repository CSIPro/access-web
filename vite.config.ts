import path from "path";

import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      manifest: {
        name: "CSI PRO Access Web",
        short_name: "Access Web",
        theme_color: "#7145d6",
        icons: [
          {
            sizes: "any",
            src: "/favicon.svg",
          },
          {
            sizes: "any",
            src: "/images/access-logo.svg",
            purpose: "monochrome",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
