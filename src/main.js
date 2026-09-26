import './styles.css';
import { upload } from '@vercel/blob/client';

const $ = id => document.getElementById(id);
const publicPage = $('publicPage');
const form = $('contactForm');
const nameInput = $('name');
const countrySelect = $('country');
const dialCode = $('dialCode');
const phoneInput = $('phone');
const companyInput = $('company');
const agencyToggle = $('agencyToggle');
const commentInput = $('comment');
const commentCount = $('commentCount');
const websiteInput = $('website');
const submitBtn = $('submitBtn');
const formStatus = $('formStatus');
const lastSaved = $('lastSaved');
const publicFlyerStatus = $('publicFlyerStatus');
const publicFlyerView = $('publicFlyerView');
const publicFlyerDownload = $('publicFlyerDownload');

const adminPanel = $('adminPanel');
const adminLogin = $('adminLogin');
const adminDashboard = $('adminDashboard');
const adminPassword = $('adminPassword');
const adminLoginBtn = $('adminLoginBtn');
const adminLoginStatus = $('adminLoginStatus');
const adminReloadBtn = $('adminReloadBtn');
const adminSearch = $('adminSearch');
const adminMessageTemplate = $('adminMessageTemplate');
const adminListStatus = $('adminListStatus');
const adminContacts = $('adminContacts');
const adminTotal = $('adminTotal');
const adminFlyerFile = $('adminFlyerFile');
const adminFlyerUploadBtn = $('adminFlyerUploadBtn');
const adminFlyerViewBtn = $('adminFlyerViewBtn');
const adminFlyerDownloadBtn = $('adminFlyerDownloadBtn');
const adminFlyerMeta = $('adminFlyerMeta');
const adminFlyerStatus = $('adminFlyerStatus');
const adminFlyerBadge = $('adminFlyerBadge');

let adminRows = [];
let flyerSnapshot = null;

function selectedCountry() {
  const [country = '', dial = ''] = String(countrySelect.value || '').split('|');
  return { country, dial };
}

function setFormStatus(message, kind = '') {
  formStatus.textContent = message;
  formStatus.className = kind ? `form-status full ${kind}` : 'form-status full';
}

function setBusy(busy) {
  submitBtn.disabled = busy;
  const label = submitBtn.querySelector('.btn-label');
  if (label) label.textContent = busy ? 'Guardando…' : 'Guardar contacto';
}

function setAgency(selected) {
  companyInput.value = selected ? 'Soy agencia' : '';
  agencyToggle.setAttribute('aria-pressed', String(selected));
}

function setFlyerButtons(available) {
  for (const button of [publicFlyerView, publicFlyerDownload]) {
    button.disabled = !available;
    button.setAttribute('aria-disabled', String(!available));
  }
}

function formatFileSize(value) {
  const bytes = Number(value || 0);
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let data = {};
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const error = new Error(data.error || `HTTP_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function loadPublicFlyerStatus() {
  try {
    const data = await requestJson('/api/flyer/status', { method: 'GET', headers: {} });
    const available = Boolean(data.ok && data.available);
    setFlyerButtons(available);
    publicFlyerStatus.textContent = available
      ? `PDF disponible${data.size ? ` · ${formatFileSize(data.size)}` : ''}`
      : 'Flyer próximamente disponible';
  } catch {
    setFlyerButtons(false);
    publicFlyerStatus.textContent = 'Flyer temporalmente no disponible';
  }
}

async function resolveFlyerUrl() {
  const data = await requestJson('/api/flyer/url', { method: 'GET', headers: {} });
  if (!data.ok || !data.available || !data.url) throw new Error('FLYER_UNAVAILABLE');
  flyerSnapshot = data;
  return data;
}

function openResolvedTarget(target, download, popup = null) {
  if (download) {
    const anchor = document.createElement('a');
    anchor.href = target;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.download = '';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }
  if (popup) {
    popup.opener = null;
    popup.location.href = target;
    return;
  }
  window.location.href = target;
}

async function openPublicFlyer(download) {
  const button = download ? publicFlyerDownload : publicFlyerView;
  if (button.disabled) return;
  const popup = download ? null : window.open('about:blank', '_blank');
  try {
    const data = await resolveFlyerUrl();
    const target = download ? (data.downloadUrl || data.url) : data.url;
    openResolvedTarget(target, download, popup);
  } catch {
    if (popup) popup.close();
    publicFlyerStatus.textContent = 'No pudimos abrir el flyer. Intentá nuevamente.';
  }
}

async function checkLastReceipt() {
  const receipt = localStorage.getItem('paFitReceipt');
  if (!receipt || receipt === 'bot') return;
  try {
    const data = await requestJson(`/api/receipt/${encodeURIComponent(receipt)}`, { method: 'GET', headers: {} });
    if (data.ok && data.exists) {
      lastSaved.hidden = false;
      lastSaved.textContent = 'Último contacto confirmado en el sistema.';
    }
  } catch {
    lastSaved.hidden = true;
  }
}

countrySelect.addEventListener('change', () => { dialCode.textContent = selectedCountry().dial; });
commentInput.addEventListener('input', () => { commentCount.textContent = `${commentInput.value.length}/600`; });
agencyToggle.addEventListener('click', () => setAgency(agencyToggle.getAttribute('aria-pressed') !== 'true'));
publicFlyerView.addEventListener('click', () => void openPublicFlyer(false));
publicFlyerDownload.addEventListener('click', () => void openPublicFlyer(true));

form.addEventListener('submit', async event => {
  event.preventDefault();
  setFormStatus('');
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  if (name.length < 2) {
    setFormStatus('Ingresá un nombre válido.', 'error');
    nameInput.focus();
    return;
  }
  if (phone.replace(/\D/g, '').length < 6) {
    setFormStatus('Ingresá un teléfono válido.', 'error');
    phoneInput.focus();
    return;
  }
  const selected = selectedCountry();
  setBusy(true);
  try {
    const data = await requestJson('/api/contacts', {
      method: 'POST',
      body: JSON.stringify({
        name,
        country: selected.country,
        countryDial: selected.dial,
        phone,
        company: companyInput.value.trim(),
        comment: commentInput.value.trim(),
        website: websiteInput.value.trim(),
        origin: 'FIT 2026',
      }),
    });
    if (!data.ok || !data.receipt) throw new Error('SAVE_FAILED');
    localStorage.setItem('paFitReceipt', data.receipt);
    form.reset();
    setAgency(false);
    countrySelect.value = 'Argentina|+54';
    dialCode.textContent = '+54';
    commentCount.textContent = '0/600';
    lastSaved.hidden = false;
    lastSaved.textContent = 'Último contacto confirmado en el sistema.';
    setFormStatus('Contacto guardado. Gracias.', 'success');
    nameInput.focus();
  } catch {
    setFormStatus('No pudimos guardar el contacto. Intentá nuevamente.', 'error');
  } finally {
    setBusy(false);
  }
});

function setAdminStatus(target, message, error = false) {
  target.textContent = message;
  target.className = error ? 'admin-status error' : 'admin-status';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[ch]);
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short',
    }).format(new Date(value));
  } catch { return String(value || ''); }
}

function whatsAppUrl(contact) {
  const digits = String(contact.phone || '').replace(/\D/g, '');
  const template = adminMessageTemplate.value || '';
  const message = template
    .replaceAll('{nombre}', contact.name || '')
    .replaceAll('{empresa}', contact.company || '')
    .replaceAll('{pais}', contact.country || '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function renderContacts() {
  const query = adminSearch.value.trim().toLocaleLowerCase('es');
  const rows = query
    ? adminRows.filter(row => [row.name, row.phone, row.country, row.company, row.comment]
      .some(value => String(value || '').toLocaleLowerCase('es').includes(query)))
    : adminRows;

  if (!rows.length) {
    adminContacts.innerHTML = '<div class="admin-empty">No hay contactos para mostrar.</div>';
    return;
  }

  adminContacts.innerHTML = rows.map((row, index) => `
    <article class="admin-contact-card" data-index="${index}">
      <div class="admin-contact-top">
        <div><h2>${escapeHtml(row.name)}</h2><p>${escapeHtml(formatDate(row.createdAt))}</p></div>
        <button type="button" class="admin-whatsapp-btn" data-phone-index="${index}">WhatsApp</button>
      </div>
      <div class="admin-contact-line"><strong>Teléfono</strong><span>${escapeHtml(row.phone)}</span></div>
      <div class="admin-contact-line"><strong>País</strong><span>${escapeHtml(row.country)}</span></div>
      <div class="admin-contact-line"><strong>Agencia</strong><span>${escapeHtml(row.company || '—')}</span></div>
      <div class="admin-contact-line"><strong>Comentario</strong><span>${escapeHtml(row.comment || '—')}</span></div>
    </article>
  `).join('');

  adminContacts.querySelectorAll('[data-phone-index]').forEach(button => {
    button.addEventListener('click', () => {
      const row = rows[Number(button.dataset.phoneIndex)];
      if (!row) return;
      window.open(whatsAppUrl(row), '_blank', 'noopener,noreferrer');
    });
  });
}

async function loadAdminContacts() {
  setAdminStatus(adminListStatus, 'Actualizando contactos…');
  try {
    const data = await requestJson('/api/admin/contacts', { method: 'POST', body: '{}' });
    adminRows = Array.isArray(data.contacts) ? data.contacts : [];
    adminTotal.textContent = String(data.total ?? adminRows.length);
    renderContacts();
    setAdminStatus(adminListStatus, adminRows.length ? 'Contactos actualizados.' : 'Todavía no hay contactos.');
  } catch (error) {
    if (error.status === 401) {
      adminDashboard.hidden = true;
      adminLogin.hidden = false;
      setAdminStatus(adminLoginStatus, 'La sesión venció. Ingresá nuevamente.', true);
      return;
    }
    setAdminStatus(adminListStatus, 'No pudimos cargar los contactos.', true);
  }
}

async function loadAdminFlyerStatus() {
  try {
    const data = await requestJson('/api/flyer/url', { method: 'GET', headers: {} });
    flyerSnapshot = data.available ? data : null;
    adminFlyerBadge.textContent = data.available ? 'Publicado' : 'Sin archivo';
    adminFlyerBadge.classList.toggle('is-live', Boolean(data.available));
    adminFlyerMeta.textContent = data.available
      ? `${data.filename || 'PDF'} · ${formatFileSize(data.size)}${data.updatedAt ? ` · ${formatDate(data.updatedAt)}` : ''}`
      : 'Todavía no hay información del flyer.';
    adminFlyerViewBtn.disabled = !data.available;
    adminFlyerDownloadBtn.disabled = !data.available;
  } catch {
    flyerSnapshot = null;
    adminFlyerBadge.textContent = 'Sin archivo';
    adminFlyerViewBtn.disabled = true;
    adminFlyerDownloadBtn.disabled = true;
  }
}

async function adminLoginSubmit() {
  const password = adminPassword.value;
  if (!password) {
    setAdminStatus(adminLoginStatus, 'Ingresá la clave.', true);
    adminPassword.focus();
    return;
  }
  adminLoginBtn.disabled = true;
  setAdminStatus(adminLoginStatus, 'Validando…');
  try {
    await requestJson('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
    adminPassword.value = '';
    adminLogin.hidden = true;
    adminDashboard.hidden = false;
    setAdminStatus(adminLoginStatus, '');
    await Promise.all([loadAdminContacts(), loadAdminFlyerStatus()]);
  } catch (error) {
    setAdminStatus(
      adminLoginStatus,
      error.status === 503 ? 'Administración todavía no configurada en Vercel.' : 'Clave incorrecta.',
      true,
    );
  } finally {
    adminLoginBtn.disabled = false;
  }
}

async function uploadFlyer() {
  const file = adminFlyerFile.files?.[0];
  if (!file) {
    setAdminStatus(adminFlyerStatus, 'Seleccioná un PDF.', true);
    return;
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    setAdminStatus(adminFlyerStatus, 'El archivo debe ser PDF.', true);
    return;
  }
  if (file.size <= 0 || file.size > 8 * 1024 * 1024) {
    setAdminStatus(adminFlyerStatus, 'El PDF debe pesar como máximo 8 MB.', true);
    return;
  }
  adminFlyerUploadBtn.disabled = true;
  setAdminStatus(adminFlyerStatus, 'Publicando PDF…');
  try {
    await upload(`materials/city-tour/incoming/${Date.now()}.pdf`, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/flyer/upload',
      contentType: 'application/pdf',
      multipart: true,
      clientPayload: JSON.stringify({ filename: file.name, size: file.size }),
    });
    adminFlyerFile.value = '';
    setAdminStatus(adminFlyerStatus, 'PDF enviado. Confirmando publicación…');
    let published = false;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 650));
      await loadAdminFlyerStatus();
      if (flyerSnapshot?.available) { published = true; break; }
    }
    await loadPublicFlyerStatus();
    setAdminStatus(adminFlyerStatus, published ? 'Flyer publicado.' : 'PDF enviado. La publicación puede tardar unos segundos.');
  } catch (error) {
    setAdminStatus(adminFlyerStatus, error.status === 401 ? 'Sesión administrativa vencida.' : 'No pudimos publicar el PDF.', true);
  } finally {
    adminFlyerUploadBtn.disabled = false;
  }
}

async function openAdminFlyer(download) {
  const popup = download ? null : window.open('about:blank', '_blank');
  try {
    const data = flyerSnapshot?.available ? flyerSnapshot : await resolveFlyerUrl();
    const target = download ? (data.downloadUrl || data.url) : data.url;
    openResolvedTarget(target, download, popup);
  } catch {
    if (popup) popup.close();
    setAdminStatus(adminFlyerStatus, 'No pudimos abrir el flyer actual.', true);
  }
}

adminLoginBtn.addEventListener('click', () => void adminLoginSubmit());
adminPassword.addEventListener('keydown', event => { if (event.key === 'Enter') void adminLoginSubmit(); });
adminReloadBtn.addEventListener('click', () => void Promise.all([loadAdminContacts(), loadAdminFlyerStatus()]));
adminSearch.addEventListener('input', renderContacts);
adminFlyerUploadBtn.addEventListener('click', () => void uploadFlyer());
adminFlyerViewBtn.addEventListener('click', () => void openAdminFlyer(false));
adminFlyerDownloadBtn.addEventListener('click', () => void openAdminFlyer(true));

const adminMode = new URLSearchParams(window.location.search).get('admin') === '1';
if (adminMode) {
  publicPage.hidden = true;
  adminPanel.hidden = false;
} else {
  publicPage.hidden = false;
  adminPanel.hidden = true;
  queueMicrotask(() => {
    void loadPublicFlyerStatus();
    void checkLastReceipt();
  });
}
