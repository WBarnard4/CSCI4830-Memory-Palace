import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from "node:url";


// http://vite.dev/config/
export default defineConfig({
  plugin: [react()],
  base: "/CSCI4830-Memory-Palace/",

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),

    },
  },

})
