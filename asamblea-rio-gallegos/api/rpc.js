export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }
  const appsScriptUrl = String(process.env.APPS_SCRIPT_URL || '').trim();
  const proxySecret = String(process.env.RPC_PROXY_SECRET || '').trim();
  if (!appsScriptUrl || !proxySecret) {
    return res.status(503).json({ ok: false, error: 'Backend todavía no configurado.' });
  }
  try {
    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const fn = String(payload.fn || '');
    const args = Array.isArray(payload.args) ? payload.args : [];
    const upstream = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn, args, proxySecret }),
      redirect: 'follow'
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); }
    catch (_) { throw new Error('El backend de Google respondió con un formato inesperado.'); }
    if (!data.ok) return res.status(400).json({ ok: false, error: data.error || 'Error del backend.' });
    return res.status(200).json({ ok: true, result: data.result });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err?.message || 'No se pudo conectar con Google.' });
  }
}
