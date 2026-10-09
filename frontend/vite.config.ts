import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // @ts-expect-error plugin type mismatch
  plugins: [react(), tailwindcss(), cesium()],
});
