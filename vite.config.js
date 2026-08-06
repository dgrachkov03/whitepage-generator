import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { buildOutputOptions } from "./plugins/pug-pages/build-output.js";
import {
  getRollupInput,
  pugPagesPlugin,
} from "./plugins/pug-pages/index.js";

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), pugPagesPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: getRollupInput(),
      output: buildOutputOptions,
    },
  },
});