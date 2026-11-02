import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
  envDir: path.resolve(__dirname, "../mobile"),
});
