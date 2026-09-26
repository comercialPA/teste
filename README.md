# Perla Andina — Captura de Contactos FIT 2026

**Versión:** `1.1.4 perla andina`

Landing pública mobile-first + panel administrativo para captura de contactos en FIT 2026.

## Arquitectura

- Frontend: Vite + JavaScript, sem frameworks visuais pesados.
- Hosting/API: Vercel.
- Persistência: **um Vercel Blob Store privado**.
  - contatos: privados, um JSON por contato;
  - flyer atual: `materials/city-tour/current.pdf`, privado no storage;
  - metadata: `materials/city-tour/meta.json`, privado no storage;
  - visitantes recebem somente o PDF atual através de `GET /api/flyer/file`.
- Admin: cookie de sessão `HttpOnly`, `SameSite=Strict`, senha somente em variável de ambiente.

## Variáveis obrigatórias no Vercel

- `ADMIN_PASSWORD`: a senha administrativa atual.
- `BLOB_READ_WRITE_TOKEN`: criado automaticamente quando um **Blob Store privado** é conectado ao projeto.
- `ADMIN_SESSION_SECRET`: opcional. Se não for definido, a sessão administrativa deriva um segredo do token privado do Blob sem expô-lo ao navegador.

Nunca colocar valores reais de senha ou token no GitHub.

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
- `GET /api/flyer/file`
- `POST /api/admin/flyer/upload` (admin autenticado)

## Regras preservadas

`Soy agencia` grava exatamente `company = "Soy agencia"`; desmarcado grava `company = ""`.
Após salvar, o formulário volta para Argentina / +54, limpa os demais dados e exibe `Contacto guardado. Gracias.`.
