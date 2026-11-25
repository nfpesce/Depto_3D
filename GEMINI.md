# Contexto del Proyecto — Departamento 3D Web (G2439)

## Objetivo
Construir y evolucionar una aplicación web 100 % navegable en 3D del departamento (4 ambientes con dependencia, 134,60 m² cubiertos + 25,00 m² balcón = 159,60 m² totales) **sin usar Blender ni Maya**, usando geometría procedural en Three.js alimentada por `src/data/departamento.json`, y publicada en GitHub Pages para acceder desde cualquier computadora.

## Stack y arquitectura
- **Motor 3D:** Three.js (ES modules) + Vite (`npm run dev` / `npm run build`).
- **Fuente única de verdad:** `src/data/departamento.json` define ambientes (`rooms`), paredes con aberturas (`walls`) y muebles (`furniture`) en metros (eje X: 0..15 m oeste→este; eje Z: -1,7..9,05 m norte→sur; altura de techos: 2,65 m).
- **Versión autocontenida:** `standalone/depto-3d-g2439.html` conserva una copia en un solo archivo HTML para abrir directo en el navegador sin build.
- **Privacidad:** La carpeta `referencias/` está en `.gitignore`. Usar esa carpeta en local para guardar `plano.pdf` y fotos de cada ambiente sin subir material privado a GitHub.

## Ajustes ya validados por el usuario (hasta Rev. 3)
1. **Dormitorio Principal (3,10×4,60 m):** cama doble contra pared izquierda con 2 mesas de luz, cómoda de madera en pared derecha **sin televisor** y **sin sillón**. Cuenta con vestidor y baño en suite.
2. **Escritorio Nelson (2,80×4,10 m, entre Dorm. Principal y Dorm. Nico):** sin camas ni biblioteca/placard detrás del escritorio; tiene placard al norte y un **escritorio amplio contra la pared derecha con 3 monitores** y silla ergonómica.
3. **Dormitorio Nico (2,80×4,30 m, más cerca de la cocina):** sustituir las 2 camas del plano por **1 sola cama individual** desplazada más cerca del ventanal (sur), con mesa de luz y placard al norte, más un **escritorio chico en la pared opuesta** (izquierda) entre la puerta y la cama.
4. **Estar Comedor (3,80×7,40 m):**
   - Comedor con **mesa rectangular de 6 sillas**, con el lado más largo (2 sillas por lado) paralelo al balcón.
   - Living invertido respecto al plano original: **TV sobre la pared derecha** (divisoria de cocina) y **sillón principal sobre la pared izquierda**, con sillones individuales y pufs espejados.
5. **Fachada sur y balcón aterrazado (validado con fotos reales):**
   - **Dormitorio Principal, Escritorio y Dormitorio Nico** están alineados en la **misma pared sur** (`z = 7.60`, balcón angosto de `1,45 m` de profundidad).
   - **Estar Comedor y Cocina** se retraen hacia adentro (`z = 6.95`), generando un único escalón a la altura de `x = 8.7` y ampliando el balcón aterrazado (`2,10 m` de profundidad) con piso de porcelanato gris claro.
   - **Mobiliario del balcón:** pequeño living exterior frente al Estar Comedor (2 sillones individuales al oeste + mesa ratona oscura con macetita blanca + sillón de 2 cuerpos al este), planta grande en maceta en el rincón del escalón (`x = 9.04, z = 7.30`), mesa bistró redonda con mosaico y 2 sillas de hierro entre Dormitorio Principal y Escritorio Nelson (`x = 3.45, z = 8.32`) y unidad exterior de aire acondicionado en el extremo oeste (`x = 0.28`).
6. **Escritorio Ceci y Baño Ceci (ex dependencia de servicio):**
   - Renombrados a **Escritorio Ceci** (`2,50×2,10 m`) y **Baño Ceci** (`2,50×1,05 m`).
   - Se eliminaron el placard y la cama verde; en la pared izquierda (`x = 12.5`) hay un **escritorio chico** y sobre la pared derecha (`x = 15.0`) una **pequeña biblioteca** con estantes.
7. **Navegación implementada:**
   - **Maqueta 3D:** órbita + botón **Mano (Rotar / Mover)** para desplazar el plano libremente + flechas relativas a cámara.
   - **Vuelo Libre:** cámara 3D sin pivote fijo (flechas/WASD vuelan en dirección de la mirada, Q/E sube/baja, mouse mira 360°).
   - **Caminar (1ª Persona):** altura 1,65 m, flechas/WASD con colisiones contra muros y paso libre por puertas y ventanales.
   - **Minimapa 2D interactivo** con clic para teletransportarse y barra superior de ambientes.

## Próximos pasos sugeridos en Antigravity
- Recibir fotos de cada ambiente en `referencias/` e ir refinando medidas reales, colores de paredes, pisos y muebles específicos en `src/data/departamento.json` y `src/main.js`.
- Modularizar `src/main.js` en `src/builders/structure.js`, `src/builders/furniture.js` y `src/controls/navigation.js` a medida que crezca el catálogo de muebles.
- Mantener sincronizado `standalone/depto-3d-g2439.html` si el usuario quiere seguir probando en un solo archivo.
