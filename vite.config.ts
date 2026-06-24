import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plain Vite single-page app. TanStack Router handles client-side routing;
// the build emits fully static assets into dist/ (no server runtime required).
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
  },
});
