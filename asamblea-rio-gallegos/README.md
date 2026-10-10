# Asamblea Río Gallegos · V1.0.4

Galería colaborativa premium publicada en Vercel, manteniendo Google Drive para las fotos y Google Sheets para los datos.

## Arquitectura
- `index.html`: frontend público.
- `api/rpc.js`: proxy server-side Vercel.
- `apps-script/Codigo.gs`: backend Google Apps Script.
- Drive: originales y ZIP.
- Sheets: fotos, perfiles, congregaciones, configuración y auditoría.

## Reglas críticas
- `OWNER_DELETE_ONLY = TRUE`
- `ADMIN_DELETE_OTHERS = FALSE`
- El secreto del proxy queda únicamente en Vercel.
