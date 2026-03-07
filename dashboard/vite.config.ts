import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'

function loadBlackboxConfig() {
  try {
    const configPath = path.join(homedir(), '.blackbox', 'config.json')
    return JSON.parse(readFileSync(configPath, 'utf8'))
  } catch {
    return null
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __BLACKBOX_CONFIG__: JSON.stringify(loadBlackboxConfig()),
  },
})
