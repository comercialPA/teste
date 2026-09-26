import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'pa_fit_admin';
const SESSION_TTL_SECONDS = 12 * 60 * 60;

function hash(value) {
  return createHash('sha256').update(String(value ?? '')).digest();
}

function safeBufferEqual(left, right) {
  return left.length === right.length && timingSafeEqual(left, right);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 24) throw new Error('ADMIN_SESSION_SECRET_NOT_CONFIGURED');
  return value;
}

export function passwordAllowed(value) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) throw new Error('ADMIN_PASSWORD_NOT_CONFIGURED');
  return safeBufferEqual(hash(value), hash(configured));
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createAdminSession() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = randomBytes(16).toString('base64url');
  const payload = `v1.${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

function parseCookies(header = '') {
  const result = {};
  for (const part of String(header).split(';')) {
    const at = part.indexOf('=');
    if (at <= 0) continue;
    result[part.slice(0, at).trim()] = decodeURIComponent(part.slice(at + 1).trim());
  }
  return result;
}

export function isAdminRequest(req) {
  try {
    const token = parseCookies(req.headers?.cookie || '')[COOKIE_NAME];
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 4 || parts[0] !== 'v1') return false;
    const exp = Number(parts[1]);
    if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false;
    const payload = parts.slice(0, 3).join('.');
    const expected = sign(payload);
    return safeBufferEqual(Buffer.from(parts[3]), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function setAdminCookie(res, token) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secure}`,
  );
}
