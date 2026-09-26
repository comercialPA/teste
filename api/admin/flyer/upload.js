import { handleUpload } from '@vercel/blob/client';
import { del, put, rename } from '@vercel/blob';
import { isAdminRequest } from '../../../lib/auth.js';
import {
  FLYER_INCOMING_PREFIX,
  FLYER_META_PATH,
  FLYER_PATH,
  MAX_FLYER_SIZE,
} from '../../../lib/constants.js';
import { clean, methodNotAllowed, noStore } from '../../../lib/helpers.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!isAdminRequest(req)) throw new Error('UNAUTHORIZED');
        if (!String(pathname).startsWith(FLYER_INCOMING_PREFIX) || !String(pathname).toLowerCase().endsWith('.pdf')) {
          throw new Error('INVALID_PATH');
        }
        const info = JSON.parse(clientPayload || '{}');
        const filename = clean(info.filename, 180);
        const size = Number(info.size || 0);
        if (!filename.toLowerCase().endsWith('.pdf')) throw new Error('INVALID_FILE');
        if (!Number.isFinite(size) || size <= 0 || size > MAX_FLYER_SIZE) throw new Error('INVALID_FILE_SIZE');
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: MAX_FLYER_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ filename, size }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const info = JSON.parse(tokenPayload || '{}');
        if (!blob || Number(blob.size || info.size || 0) > MAX_FLYER_SIZE) {
          if (blob?.url) await del(blob.url).catch(() => undefined);
          throw new Error('INVALID_FILE_SIZE');
        }
        const current = await rename(blob.url, FLYER_PATH, {
          access: 'public',
          contentType: 'application/pdf',
          allowOverwrite: true,
          addRandomSuffix: false,
          cacheControlMaxAge: 60,
        });
        const updatedAt = new Date().toISOString();
        const meta = {
          filename: clean(info.filename, 180) || 'City_Tour_Perlas_del_Sur.pdf',
          size: Number(blob.size || info.size || 0),
          updatedAt,
          url: `${current.url}?v=${encodeURIComponent(updatedAt)}`,
          downloadUrl: `${current.downloadUrl || current.url}?v=${encodeURIComponent(updatedAt)}`,
        };
        await put(FLYER_META_PATH, JSON.stringify(meta), {
          access: 'public',
          contentType: 'application/json',
          allowOverwrite: true,
          addRandomSuffix: false,
          cacheControlMaxAge: 60,
        });
      },
    });
    return res.status(200).json(response);
  } catch (error) {
    const message = String(error?.message || error || 'UPLOAD_FAILED');
    const status = message.includes('UNAUTHORIZED') ? 401 : 400;
    console.error('flyer_upload_failed', message);
    return res.status(status).json({ ok: false, error: message });
  }
}
