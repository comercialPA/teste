import { methodNotAllowed, noStore } from '../../lib/helpers.js';
import { flyerMeta } from '../../lib/storage.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const meta = await flyerMeta();
    if (!meta) return res.status(200).json({ ok: true, available: false });

    const version = encodeURIComponent(meta.updatedAt || '');
    const url = `/api/flyer/file?v=${version}`;
    const downloadUrl = `/api/flyer/file?download=1&v=${version}`;

    return res.status(200).json({
      ok: true,
      available: true,
      filename: meta.filename,
      size: meta.size,
      updatedAt: meta.updatedAt,
      url,
      downloadUrl,
    });
  } catch (error) {
    console.error('flyer_url_failed', error);
    return res.status(200).json({ ok: true, available: false });
  }
}
