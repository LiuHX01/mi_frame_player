import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    glsl(undefined, /\.(glsl|wgsl|vert|frag|vs|fs)$/i, 'glsl'),
  ]
})
