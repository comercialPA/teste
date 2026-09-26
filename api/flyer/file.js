import { Readable } from 'node:stream';
import { get } from '@vercel/blob';
import { FLYER_PATH } from '../../lib/constants.js';
import { methodNotAllowed, noStore } from '../../lib/helpers.js';
import { flyerMeta } from '../../lib/storage.js';

function safeFilename(value) {
  const fallback = 'City_Tour_Perlas_del_Sur.pdf';
  const filename = String(value || fallback)
    .replace(/[\\/"\r\n]/g, '_')
    .slice(0, 180);
  return filename.toLowerCase().endsWith('.pdf') ? filename : fallback;
}

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const meta = await flyerMeta();
    if (!meta) return res.status(404).json({ ok: false, error: 'FLYER_NOT_FOUND' });

    const result = await get(FLYER_PATH, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200) {
      return res.status(404).json({ ok: false, error: 'FLYER_NOT_FOUND' });
    }

    const filename = safeFilename(meta.filename);
    const disposition = req.query?.download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return Readable.fromWeb(result.stream).pipe(res);
  } catch (error) {
    console.error('flyer_file_failed', error);
    return res.status(404).json({ ok: false, error: 'FLYER_NOT_FOUND' });
  }
}
