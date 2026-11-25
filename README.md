# Departamento 3D Web — G2439

Modelo 3D interactivo navegable desde el navegador (Three.js + Vite + JSON), sin dependencias de Blender ni Maya.

## Uso rápido en local
```bash
npm install
npm run dev
```
Abrí la URL local que muestre Vite (habitualmente `http://localhost:5173`).

## Uso sin instalar nada (archivo único)
Abrí directamente `standalone/depto-3d-g2439.html` en Chrome, Edge, Firefox o Safari.

## Continuar en Google Antigravity
1. Descomprimí esta carpeta en tu computadora.
2. Opcional: colocá `plano.pdf` y las fotos de tu departamento dentro de `referencias/` (ignorada por `.gitignore`).
3. En Antigravity, hacé **New Project → Add Folder** y seleccioná esta carpeta. Antigravity leerá automáticamente `GEMINI.md` con todo el contexto y decisiones ya validadas.

## Publicar en GitHub Pages
1. Inicializá Git y subí la carpeta a un repositorio de GitHub en la rama `main`.
2. En GitHub, andá a **Settings → Pages → Build and deployment → Source** y elegí **GitHub Actions**.
3. Cada `git push` a `main` compilará y publicará automáticamente el sitio con `.github/workflows/deploy.yml`.
