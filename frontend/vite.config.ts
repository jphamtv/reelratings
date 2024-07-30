import { defineConfig, mergeConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { UserConfig as VitestUserConfig } from "vitest/config";

const vitestConfig: VitestUserConfig = {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
};

// https://vitejs.dev/config/
export default mergeConfig(
  defineConfig({
    plugins: [react()],
    base: "/",
  }),
  vitestConfig,
);
