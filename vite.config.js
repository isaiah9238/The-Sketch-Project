import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // This splits Firebase and other heavy libraries into their own separate files
        // to massively speed up your site loading time!
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('@google/genai')) {
              return 'vendor-genai';
            }
            return 'vendor'; // everything else
          }
        }
      }
    }
  }
});
