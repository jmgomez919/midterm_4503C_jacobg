import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: enables JSX support via the React plugin
export default defineConfig({
  plugins: [react()],
})
