import { isAdminRequest } from '../lib/auth.js';
import { allContacts } from '../lib/storage.js';
import { csvCell, methodNotAllowed, noStore } from '../lib/helpers.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!isAdminRequest(req)) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });

  const contacts = await allContacts();
  const rows = [[
    'Fecha/Hora', 'Nombre', 'País', 'Teléfono', 'Empresa', 'Comentario', 'Origen', 'ID',
  ].map(csvCell).join(',')];
  for (const item of [...contacts].reverse()) {
    rows.push([
      item.createdAt, item.name, item.country, item.phone, item.company, item.comment, item.origin, item.id,
    ].map(csvCell).join(','));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="contactos-fit-2026.csv"');
  return res.status(200).send('\uFEFF' + rows.join('\n'));
}
