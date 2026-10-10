# Asamblea Río Gallegos · V1.0.5

Galería colaborativa premium para reunir y compartir las fotos de la Asamblea Río Gallegos 2026.

## Producción
- App público: https://asamblea-rio-gallegos.vercel.app
- Frontend y proxy: Vercel
- Fotos: Google Drive
- Datos: Google Sheets
- Backend de datos: Google Apps Script

## Arquitectura
- `index.html`: frontend público.
- `app-*.css` + `app-loader.js` + `app-chunk-*.txt`: interfaz y lógica del navegador.
- `api/rpc.js`: proxy server-side Vercel; el secreto nunca se expone al navegador.
- Google Apps Script: acceso autorizado a Drive/Sheets.

## Reglas críticas
- `OWNER_DELETE_ONLY = TRUE`
- `ADMIN_DELETE_OTHERS = FALSE`
- Cada participante solo puede eliminar las fotos asociadas a su propio perfil/segredo.
- Administración puede ocultar/republicar, pero no eliminar fotos ajenas desde el app.

## V1.0.5
Optimización visual para celulares de 320–719 px: cabecera, galería, filtros, barra inferior, modales, QR, carga de fotos, lightbox, áreas táctiles y safe-area de Android/iPhone. No cambia la lógica de datos ni los eventos del frontend.

## Estado
El frontend V1.0.5 está publicado. Para activar la lectura/escritura de Drive y Sheets en el dominio Vercel hace falta completar una única implantación/autorización del backend Google Apps Script y configurar su URL `/exec` como `APPS_SCRIPT_URL` en Vercel.
