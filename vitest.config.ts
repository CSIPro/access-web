import path from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    APP_VERSION: JSON.stringify("test"),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto"],
    env: {
      VITE_ACCESS_API_URL: "http://api.test",
    },
  },
});
