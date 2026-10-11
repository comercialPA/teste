import { list } from '@vercel/blob';
import crypto from 'node:crypto';

const STATUS_PUBLISHED = 'PUBLICADA';
const MAX_OWN_PHOTOS = 1000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ ok: false, error: 'Almacenamiento no configurado.' });
  }

  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const profileId = safeText(payload.profileId, 100);
    const ownerSecret = safeText(payload.ownerSecret, 300);
    await verifyProfile(profileId, ownerSecret);

    const blobs = (await listAll('photos/')).filter(b => b.pathname.endsWith('.json'));
    const items = [];

    for (let i = 0; i < blobs.length; i += 40) {
      const batch = blobs.slice(i, i + 40);
      const rows = await Promise.all(batch.map(blob => fetchJsonUrl(blob.url)));
      for (const meta of rows) {
        if (!meta || meta.status !== STATUS_PUBLISHED || !meta.fileUrl) continue;
        if (String(meta.profileId || '') !== profileId) continue;
        items.push(publicPhoto(meta));
        if (items.length >= MAX_OWN_PHOTOS) break;
      }
      if (items.length >= MAX_OWN_PHOTOS) break;
    }

    items.sort((a, b) => String(b.uploadedAt || '').localeCompare(String(a.uploadedAt || '')));
    return res.status(200).json({ ok: true, items, total: items.length });
  } catch (err) {
    console.error('[RG26 MY PHOTOS]', err);
    return res.status(400).json({ ok: false, error: err?.message || 'No pudimos cargar tus fotos.' });
  }
}

async function verifyProfile(profileId, ownerSecret) {
  if (!profileId || !ownerSecret) throw new Error('Perfil inválido.');
  const profile = await readJson(`profiles/${safeId(profileId)}.json`);
  if (!profile || !secureEqual(String(profile.ownerHash || ''), hash(ownerSecret))) {
    throw new Error('No pudimos verificar tu perfil.');
  }
  return profile;
}

function publicPhoto(meta) {
  return {
    id: meta.id,
    uploaderName: meta.uploaderName || '',
    congregation: meta.congregation || '',
    caption: meta.caption || '',
    uploadedAt: meta.uploadedAt || '',
    thumbnailUrl: meta.thumbnailUrl || meta.fileUrl || '',
    downloadUrl: meta.downloadUrl || meta.fileUrl || '',
    mimeType: meta.mimeType || '',
    isMine: true
  };
}

async function readJson(pathname) {
  const result = await list({ prefix: pathname, limit: 5 });
  const found = (result.blobs || []).find(b => b.pathname === pathname);
  return found ? fetchJsonUrl(found.url) : null;
}

async function fetchJsonUrl(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
  } catch (_) {
    return null;
  }
}

async function listAll(prefix) {
  const out = [];
  let cursor;
  do {
    const result = await list({ prefix, limit: 1000, ...(cursor ? { cursor } : {}) });
    out.push(...(result.blobs || []));
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
  return out;
}

function safeId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120); }
function safeText(v, max = 200) { return String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max); }
function hash(v) { return crypto.createHash('sha256').update(String(v || ''), 'utf8').digest('hex'); }
function secureEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
