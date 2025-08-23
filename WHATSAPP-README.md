# Resumen de la integración WhatsApp en este repo

Objetivo: mantener la integración simple y concentrada.

Estado actual:
- La lógica cliente está en `js/whatsapp-integration.js`.
- El backend está en `whatsapp-server/server.js`.
- Hay varios archivos y vistas históricas para diagnóstico (`views/whatsapp-*.html`, `whatsapp-qr-simple.html`) que pueden eliminarse o archivarse.

Sugerencia de refactor mínimo:
1. Consolidar la lógica cliente en `js/whatsapp-integration.js` (ya hecho).
2. Eliminar/archivar archivos vacíos o duplicados en `js/` (mover `whatsapp-qr.js`, `whatsapp-auto-sender.js`, `whatsapp-bookmarklet.js` a `whatsapp/legacy/`).
3. Renombrar endpoints en cliente para que apunten a `/api/whatsapp/*` (ya actualizado).
4. Añadir tests mínimos y documentación en `whatsapp-server/README.md`.

Si quieres, procedo con un refactor adicional:
- Eliminar vistas duplicadas en `views/` y dejar solo `views/whatsapp-qr.html`.
- Simplificar `index.html` para cargar solo `js/whatsapp-integration.js` cuando la pestaña WhatsApp esté activa.
- Añadir script npm en `whatsapp-server/package.json` para `start`.

Dime si continúo con cualquiera de las acciones sugeridas.
