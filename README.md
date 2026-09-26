# Perla Andina — Captura de Contactos FIT 2026

**Versión:** `1.1.3 perla andina`

Landing pública mobile-first + panel administrativo para captura de contactos en FIT 2026.

## Arquitectura

- Frontend: Vite + JavaScript, sem frameworks visuais pesados.
- Hosting/API: Vercel.
- Persistência: Vercel Blob.
  - contatos: privados, um JSON por contato;
  - flyer atual: `materials/city-tour/current.pdf`;
  - metadata: `materials/city-tour/meta.json`.
- Admin: cookie de sessão `HttpOnly`, `SameSite=Strict`, senha somente em variável de ambiente.

## Variáveis obrigatórias no Vercel

- `ADMIN_PASSWORD`: a senha administrativa atual.
- `ADMIN_SESSION_SECRET`: segredo aleatório com pelo menos 24 caracteres.
- `BLOB_READ_WRITE_TOKEN`: criado pelo Vercel quando o Blob Store é conectado ao projeto.

Nunca colocar os valores reais no GitHub.

## URLs

- Público: `/`
- Admin: `/?admin=1`
- Catálogo oficial: `https://catalogoperlaandina.vercel.app/menu`

## Endpoints

- `GET /api/_healthcheck`
- `POST /api/contacts`
- `GET /api/receipt/:receipt`
- `POST /api/admin/login`
- `POST /api/admin/contacts`
- `GET /api/contacts.csv` (admin autenticado)
- `GET /api/flyer/status`
- `GET /api/flyer/url`
- `POST /api/admin/flyer/upload` (admin autenticado)

## Regras preservadas

`Soy agencia` grava exatamente `company = "Soy agencia"`; desmarcado grava `company = ""`.
Após salvar, o formulário volta para Argentina / +54, limpa os demais dados e exibe `Contacto guardado. Gracias.`.
