import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup-env.ts"],
    include: ["src/test/**/*.test.ts"],
    exclude: ["src/test/**/*.db.test.ts"],
  },
});
