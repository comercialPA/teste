import { APP_VERSION } from '../lib/constants.js';
import { methodNotAllowed, noStore } from '../lib/helpers.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return res.status(200).json({ ok: true, version: APP_VERSION });
}
