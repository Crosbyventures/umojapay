import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT for GitHub Pages custom domain:
// base should be "/" (not "/repo/")
export default defineConfig({
  plugins: [react()],
  base: "/"
});