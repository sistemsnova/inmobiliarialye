import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Carga las variables que empiezan con VITE_
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // ESTA LÍNEA ES LA QUE CORRIGE LOS ERRORES 404 EN LA WEB
      base: './', 

      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Mapeamos las variables para que el código las encuentre
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          // Ajustamos el alias para que apunte a la carpeta src
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});