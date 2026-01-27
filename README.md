
# InmoAI CRM - Despliegue de Inmobiliaria LYE

Este proyecto es un CRM de alto rendimiento para gestión inmobiliaria.

## 🚀 Pasos para subir a GitHub (sistemsnova/inmobiliarialye)

1. **Instalar Node.js**: Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/).
2. **Preparar Carpeta**: Crea una carpeta en tu PC y copia todos los archivos del proyecto allí.
3. **Inicializar Git**:
   ```bash
   git init
   git remote add origin https://github.com/sistemsnova/inmobiliarialye.git
   ```
4. **Subir Código**:
   ```bash
   git add .
   git commit -m "Build: Versión inicial del CRM InmoAI"
   git branch -M main
   git push -u origin main
   ```

## 🌐 Publicar en la Web (Vercel)

1. Entra en [Vercel.com](https://vercel.com).
2. Conecta tu cuenta de GitHub.
3. Selecciona el repositorio `inmobiliarialye`.
4. **IMPORTANTE**: En "Environment Variables", añade:
   - Key: `API_KEY`
   - Value: (Tu API Key de Google Gemini)
5. Haz clic en **Deploy**.

## 🛠️ Desarrollo Local
```bash
npm install
npm run dev
```
