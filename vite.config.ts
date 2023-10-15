import path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/access",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
