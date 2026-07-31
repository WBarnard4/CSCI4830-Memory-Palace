import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from "node:url";


// http://vite.dev/config/
export default defineConfig({
  plugin: [react()],
  base: process.env.VERCEL ? "/" : "/CSCI4830-Memory-Palace/",

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),

    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  }
});
