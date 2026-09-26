import { isAdminRequest } from '../../lib/auth.js';
import { methodNotAllowed, noStore } from '../../lib/helpers.js';
import { allContacts } from '../../lib/storage.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isAdminRequest(req)) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
  try {
    const contacts = await allContacts();
    return res.status(200).json({ ok: true, total: contacts.length, contacts });
  } catch (error) {
    console.error('admin_contacts_failed', error);
    return res.status(500).json({ ok: false, error: 'READ_FAILED' });
  }
}
