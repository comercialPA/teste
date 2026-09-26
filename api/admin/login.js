import { createAdminSession, passwordAllowed, setAdminCookie } from '../../lib/auth.js';
import { methodNotAllowed, noStore } from '../../lib/helpers.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    if (!passwordAllowed(req.body?.password)) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
    setAdminCookie(res, createAdminSession());
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('admin_login_config', error);
    return res.status(503).json({ ok: false, error: 'ADMIN_NOT_CONFIGURED' });
  }
}
