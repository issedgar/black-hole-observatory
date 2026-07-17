# Observatorio de Agujero Negro

Simulación interactiva, educativa y cinematográfica de un agujero negro que
consume planetas, lunas, asteroides, naves y otras formas de materia. Combina
una visualización con fundamento científico, una interfaz de observatorio
(FUI) y un sistema de eventos de destrucción de materia en tiempo real, todo
ejecutándose íntegramente en el navegador con WebGL2.

## Requisitos

- Navegador moderno con **WebGL2** (Chrome, Edge, Firefox o Safari recientes) y
  aceleración por hardware activada.
- **Node.js 24+** (ver `engines` en `package.json`).
- **npm** (gestor de paquetes del proyecto).

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre la URL local que muestra Vite (por defecto `http://localhost:5173`).

Otros comandos:

```bash
npm run build     # Comprobación de tipos estricta + build de producción
npm run preview   # Sirve el build de producción
npm run lint      # ESLint
```

## Controles

- **Ratón**: arrastrar para orbitar, rueda para acercar/alejar (con límite para
  no cruzar el horizonte). Gestos táctiles equivalentes en móvil.
- **Teclado**: `C` cámara cinemática, `R` reiniciar cámara, `E` generar evento.
- **HUD**: panel de controles con secciones de simulación (pausa, escala de
  tiempo, generación de eventos), cámara, parámetros físicos (masa, espín),
  parámetros visuales (densidad de disco, lente, partículas, exposición, bloom,
  calidad) y sonido.
- **Modo educativo**: activa explicaciones de conceptos y diagramas de regiones
  (esfera de fotones, ISCO, sombra, vectores de marea) sin pausar la simulación.

## Características

- Sombra del horizonte absolutamente negra con anillo de fotones asimétrico.
- **Lente gravitacional** que curva el fondo (estrellas, nebulosa) y los objetos,
  con arcos de Einstein y duplicación de imágenes.
- **Disco de acreción** procedural por ray-marching con curvatura: rotación
  diferencial, turbulencia, asimetría Doppler relativista, estructura vertical e
  imágenes lensadas por encima y por debajo del agujero.
- **Eventos de captura** con máquina de estados de 9 fases, trayectorias
  orbitales (gravedad newtoniana con decaimiento y precesión), **espaguetización
  por vértices**, fragmentación con partículas agrupadas (pooling) y reacción del
  disco a la materia absorbida.
- **HUD/FUI** con valores de simulación en vivo y FPS medido; responsive y
  accesible (navegación por teclado, foco visible, `prefers-reduced-motion`).
- **Sonido procedural** opcional (desactivado hasta que el usuario lo activa).
- **Calidad adaptativa** (perfiles low/medium/high/ultra) que se ajusta a los FPS
  medidos; detección de capacidad y manejo de pérdida de contexto WebGL.

## Aproximaciones del modelo

La simulación tiene fundamento matemático pero está optimizada para tiempo real.
Las principales aproximaciones (también documentadas en el modo educativo) son:

- La lente gravitacional usa una aproximación analítica en espacio de pantalla
  basada en el parámetro de impacto, no integración de geodésicas por píxel.
- El disco de acreción se genera con ray-marching curvado y emisión procedural;
  no es transferencia radiativa.
- Las órbitas usan gravedad newtoniana con decaimiento y precesión aproximada,
  no dinámica relativista completa.
- El espín (Kerr) es una aproximación visual y analítica (ISCO y esfera de
  fotones por las relaciones de Bardeen) sobre un modelo base de Schwarzschild.
- La temperatura del disco y la tasa de acreción son estimaciones de orden de
  magnitud.
- El sonido es una representación artística: el espacio no transmite sonido.

## Stack

React · TypeScript · Vite · Three.js · React Three Fiber · GLSL · Zustand · Web
Audio API. Sin backend, base de datos ni servicios externos: todo se ejecuta en
el navegador.
```
