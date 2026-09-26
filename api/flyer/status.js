import { methodNotAllowed, noStore } from '../../lib/helpers.js';
import { flyerMeta } from '../../lib/storage.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const meta = await flyerMeta();
    if (!meta) return res.status(200).json({ ok: true, available: false });
    return res.status(200).json({
      ok: true,
      available: true,
      filename: meta.filename,
      size: meta.size,
      updatedAt: meta.updatedAt,
    });
  } catch {
    return res.status(200).json({ ok: true, available: false });
  }
}
