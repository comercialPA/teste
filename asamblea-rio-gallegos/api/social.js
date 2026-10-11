import { put, list, del } from '@vercel/blob';
import crypto from 'node:crypto';
import webpush from 'web-push';

const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || 'https://asamblea-rio-gallegos.vercel.app';
const STATUS_PUBLISHED = 'PUBLICADA';
const MAX_NOTIFICATIONS = 60;

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
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const action = safeText(body.action, 50);
    const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};

    const methods = {
      config: apiConfig,
      state: apiLikeState,
      like: apiToggleLike,
      notifications: apiNotifications,
      markRead: apiMarkRead,
      subscribe: apiSubscribe,
      unsubscribe: apiUnsubscribe
    };
    if (!methods[action]) throw new Error('Acción social no permitida.');

    const result = await methods[action](payload);
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('[RG26 SOCIAL]', err);
    return res.status(400).json({ ok: false, error: err?.message || 'Error social.' });
  }
}

async function apiConfig() {
  return {
    version: '1.1.6',
    pushAvailable: pushConfigured(),
    vapidPublicKey: pushConfigured() ? String(process.env.VAPID_PUBLIC_KEY || '') : ''
  };
}

async function apiLikeState(payload) {
  const photoId = safeText(payload.photoId, 100);
  if (!photoId) throw new Error('Foto inválida.');
  const meta = await readJson(photoMetaPath(photoId));
  if (!meta || meta.status !== STATUS_PUBLISHED || !meta.fileUrl) throw new Error('Foto no encontrada.');

  let liked = false;
  const profileId = safeText(payload.profileId, 100);
  if (profileId) {
    const record = await readJson(likePath(photoId, profileId));
    liked = !!record?.active;
  }
  return { liked, count: Math.max(0, Number(meta.likeCount || 0)), isOwn: !!profileId && profileId === String(meta.profileId || '') };
}

async function apiToggleLike(payload) {
  const photoId = safeText(payload.photoId, 100);
  const profileId = safeText(payload.profileId, 100);
  const ownerSecret = safeText(payload.ownerSecret, 300);
  if (!photoId) throw new Error('Foto inválida.');

  const profile = await verifyProfile(profileId, ownerSecret);
  const meta = await readJson(photoMetaPath(photoId));
  if (!meta || meta.status !== STATUS_PUBLISHED || !meta.fileUrl) throw new Error('Foto no encontrada.');
  if (String(meta.profileId || '') === profileId) throw new Error('No podés indicar Me gusta en tu propia foto.');

  const path = likePath(photoId, profileId);
  const previous = await readJson(path);
  const nextLiked = !previous?.active;
  const now = new Date().toISOString();
  const oldCount = Math.max(0, Number(meta.likeCount || 0));
  const nextCount = Math.max(0, oldCount + (nextLiked ? 1 : -1));

  const likeRecord = {
    photoId,
    likerHash: hash(profileId),
    active: nextLiked,
    createdAt: previous?.createdAt || now,
    updatedAt: now,
    lastNotifiedAt: previous?.lastNotifiedAt || ''
  };

  meta.likeCount = nextCount;
  meta.socialUpdatedAt = now;

  if (nextLiked && shouldNotify(previous?.lastNotifiedAt)) {
    const notification = {
      id: crypto.randomUUID(),
      type: 'LIKE',
      photoId,
      fromName: safeText(profile.name, 80),
      message: `${safeText(profile.name, 80)} indicó que le gusta tu foto.`,
      createdAt: now,
      readAt: '',
      url: `${PUBLIC_APP_URL}/?foto=${encodeURIComponent(photoId)}`
    };
    await createNotification(String(meta.profileId || ''), notification);
    likeRecord.lastNotifiedAt = now;
  }

  await Promise.all([
    writeJson(path, likeRecord),
    writeJson(photoMetaPath(photoId), meta)
  ]);

  return { liked: nextLiked, count: nextCount };
}

async function apiNotifications(payload) {
  const profile = await verifyProfile(safeText(payload.profileId, 100), safeText(payload.ownerSecret, 300));
  const prefix = notificationPrefix(profile.profileId);
  const blobs = (await listAll(prefix)).filter(b => b.pathname.endsWith('.json'));
  const selected = blobs.slice(-MAX_NOTIFICATIONS).reverse();
  const items = [];
  for (const blob of selected) {
    const encrypted = await fetchJsonUrl(blob.url);
    if (!encrypted) continue;
    const decoded = decryptJson(encrypted);
    if (decoded?.id) items.push(decoded);
  }
  items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return { items, unread: items.filter(n => !n.readAt).length };
}

async function apiMarkRead(payload) {
  const profile = await verifyProfile(safeText(payload.profileId, 100), safeText(payload.ownerSecret, 300));
  const prefix = notificationPrefix(profile.profileId);
  const blobs = (await listAll(prefix)).filter(b => b.pathname.endsWith('.json')).slice(-MAX_NOTIFICATIONS);
  const now = new Date().toISOString();
  let changed = 0;

  for (const blob of blobs) {
    const encrypted = await fetchJsonUrl(blob.url);
    if (!encrypted) continue;
    const item = decryptJson(encrypted);
    if (!item?.id || item.readAt) continue;
    item.readAt = now;
    await writeJson(blob.pathname, encryptJson(item));
    changed++;
  }
  return { ok: true, changed };
}

async function apiSubscribe(payload) {
  if (!pushConfigured()) throw new Error('Notificaciones push no configuradas.');
  const profile = await verifyProfile(safeText(payload.profileId, 100), safeText(payload.ownerSecret, 300));
  const subscription = normalizeSubscription(payload.subscription);
  const path = pushPath(profile.profileId, subscription.endpoint);
  await writeJson(path, encryptJson({ subscription, createdAt: new Date().toISOString() }));
  return { ok: true };
}

async function apiUnsubscribe(payload) {
  const profile = await verifyProfile(safeText(payload.profileId, 100), safeText(payload.ownerSecret, 300));
  const endpoint = safeText(payload.endpoint, 2000);
  if (endpoint) await safeDeleteByPath(pushPath(profile.profileId, endpoint));
  return { ok: true };
}

async function createNotification(ownerProfileId, notification) {
  if (!ownerProfileId) return;
  const pathname = `${notificationPrefix(ownerProfileId)}${Date.now()}-${safeId(notification.id)}.json`;
  try {
    await writeJson(pathname, encryptJson(notification));
  } catch (err) {
    console.error('[RG26 NOTIFICATION STORE]', err);
  }

  if (!pushConfigured()) return;
  try {
    await sendPushToProfile(ownerProfileId, notification);
  } catch (err) {
    console.error('[RG26 PUSH]', err);
  }
}

async function sendPushToProfile(profileId, notification) {
  configureWebPush();
  const prefix = pushPrefix(profileId);
  const blobs = (await listAll(prefix)).filter(b => b.pathname.endsWith('.json'));
  if (!blobs.length) return;

  const payload = JSON.stringify({
    title: 'Nuevo Me gusta',
    body: notification.message,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `like-${notification.photoId}`,
    url: notification.url,
    photoId: notification.photoId
  });

  for (const blob of blobs) {
    const encrypted = await fetchJsonUrl(blob.url);
    if (!encrypted) continue;
    const stored = decryptJson(encrypted);
    const subscription = stored?.subscription;
    if (!subscription?.endpoint) continue;
    try {
      await webpush.sendNotification(subscription, payload, { TTL: 60 * 60 * 12, urgency: 'normal' });
    } catch (err) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await safeDelete(blob.url);
      } else {
        console.error('[RG26 PUSH DEVICE]', err?.statusCode || '', err?.message || err);
      }
    }
  }
}

function configureWebPush() {
  webpush.setVapidDetails(
    String(process.env.VAPID_SUBJECT || PUBLIC_APP_URL),
    String(process.env.VAPID_PUBLIC_KEY || ''),
    String(process.env.VAPID_PRIVATE_KEY || '')
  );
}

function pushConfigured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.NOTIF_ENC_KEY);
}

async function verifyProfile(profileId, ownerSecret) {
  if (!profileId || !ownerSecret) throw new Error('Primero creá o recuperá tu perfil.');
  const profile = await readJson(profilePath(profileId));
  if (!profile || !secureEqual(String(profile.ownerHash || ''), hash(ownerSecret))) throw new Error('No pudimos verificar tu perfil.');
  return profile;
}

function normalizeSubscription(value) {
  if (!value || typeof value !== 'object') throw new Error('Suscripción push inválida.');
  const endpoint = safeText(value.endpoint, 2000);
  const p256dh = safeText(value.keys?.p256dh, 500);
  const auth = safeText(value.keys?.auth, 500);
  if (!endpoint || !p256dh || !auth) throw new Error('Suscripción push incompleta.');
  return { endpoint, expirationTime: value.expirationTime || null, keys: { p256dh, auth } };
}

function shouldNotify(last) {
  if (!last) return true;
  const ms = Date.parse(last);
  return !Number.isFinite(ms) || Date.now() - ms > 12 * 60 * 60 * 1000;
}

function encryptionKey() {
  const raw = String(process.env.NOTIF_ENC_KEY || '');
  if (!raw) throw new Error('Cifrado de notificaciones no configurado.');
  const key = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(raw.length / 4) * 4, '='), 'base64');
  if (key.length !== 32) throw new Error('Clave de cifrado inválida.');
  return key;
}

function encryptJson(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { v: 1, iv: iv.toString('base64url'), tag: tag.toString('base64url'), data: data.toString('base64url') };
}

function decryptJson(value) {
  try {
    if (!value || value.v !== 1) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(value.iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(value.tag, 'base64url'));
    const out = Buffer.concat([decipher.update(Buffer.from(value.data, 'base64url')), decipher.final()]);
    return JSON.parse(out.toString('utf8'));
  } catch (_) {
    return null;
  }
}

async function readJson(pathname) {
  const found = await findExact(pathname);
  if (!found) return null;
  return fetchJsonUrl(found.url);
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

async function findExact(pathname) {
  const result = await list({ prefix: pathname, limit: 5 });
  return (result.blobs || []).find(b => b.pathname === pathname) || null;
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

async function writeJson(pathname, value) {
  return put(pathname, JSON.stringify(value), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

async function safeDeleteByPath(pathname) {
  const found = await findExact(pathname);
  if (found?.url) await safeDelete(found.url);
}

async function safeDelete(url) {
  try { await del(url); } catch (_) {}
}

function profilePath(id) { return `profiles/${safeId(id)}.json`; }
function photoMetaPath(id) { return `photos/${safeId(id)}.json`; }
function likePath(photoId, profileId) { return `social/likes/${safeId(photoId)}/${hash(profileId).slice(0, 40)}.json`; }
function notificationPrefix(profileId) { return `social/notifications/${hash(profileId).slice(0, 40)}/`; }
function pushPrefix(profileId) { return `social/push/${hash(profileId).slice(0, 40)}/`; }
function pushPath(profileId, endpoint) { return `${pushPrefix(profileId)}${hash(endpoint).slice(0, 40)}.json`; }
function safeId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120); }
function safeText(v, max = 200) { return String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max); }
function hash(v) { return crypto.createHash('sha256').update(String(v || ''), 'utf8').digest('hex'); }
function secureEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
