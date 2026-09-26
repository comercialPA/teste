import { CONTACT_ORIGIN } from '../lib/constants.js';
import { clean, methodNotAllowed, noStore } from '../lib/helpers.js';
import { saveContact } from '../lib/storage.js';

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const source = req.body || {};
    if (clean(source.website, 100)) return res.status(200).json({ ok: true, receipt: 'bot' });

    const name = clean(source.name, 90);
    const country = clean(source.country, 80);
    const dial = clean(source.countryDial, 8);
    const phone = clean(source.phone, 30);
    const company = clean(source.company, 120) === 'Soy agencia' ? 'Soy agencia' : '';
    const comment = clean(source.comment, 600);
    const origin = clean(source.origin || CONTACT_ORIGIN, 100) || CONTACT_ORIGIN;

    if (name.length < 2) return res.status(400).json({ ok: false, error: 'INVALID_NAME' });
    if (!country) return res.status(400).json({ ok: false, error: 'INVALID_COUNTRY' });
    if (phone.replace(/\D/g, '').length < 6) return res.status(400).json({ ok: false, error: 'INVALID_PHONE' });

    const record = {
      createdAt: new Date().toISOString(),
      name,
      country,
      phone: `${dial} ${phone}`.trim(),
      company,
      comment,
      origin,
    };

    const saved = await saveContact(record);
    return res.status(200).json({ ok: true, receipt: saved.receipt });
  } catch (error) {
    console.error('contacts_save_failed', error);
    return res.status(500).json({ ok: false, error: 'WRITE_FAILED' });
  }
}
