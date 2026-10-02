import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import blog from './scripts/vite-plugin-blog.mjs'
import reactionsDevApi from './scripts/vite-plugin-reactions-dev.mjs'

export default defineConfig({
  plugins: [react(), blog(), reactionsDevApi()],
})
