import { methodNotAllowed, noStore, safeFitDate } from '../../lib/helpers.js';
import { receiptExists } from '../../lib/storage.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const receipt = String(req.query?.receipt || '');
  const at = receipt.indexOf('.');
  const date = safeFitDate(at > 0 ? receipt.slice(0, at) : '');
  const id = at > 0 ? receipt.slice(at + 1) : '';
  if (!date || !/^[0-9a-f-]{36}$/i.test(id)) return res.status(200).json({ ok: true, exists: false });
  try {
    return res.status(200).json({ ok: true, exists: await receiptExists(date, id) });
  } catch {
    return res.status(200).json({ ok: true, exists: false });
  }
}
