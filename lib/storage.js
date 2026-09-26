import { get, list, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { CONTACT_DATES, FLYER_META_PATH } from './constants.js';
import { localDate } from './helpers.js';

async function listAll(prefix) {
  const blobs = [];
  let cursor;
  do {
    const result = await list({ prefix, limit: 1000, cursor });
    blobs.push(...result.blobs);
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);
  return blobs;
}

async function privateJson(urlOrPathname) {
  const result = await get(urlOrPathname, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200) return null;
  try {
    return await new Response(result.stream).json();
  } catch {
    return null;
  }
}

export async function saveContact(record) {
  const date = localDate(new Date(record.createdAt));
  const id = randomUUID();
  const pathname = `contacts/${date}/${id}.json`;
  await put(pathname, JSON.stringify(record), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
  return { id, date, receipt: `${date}.${id}` };
}

export async function receiptExists(date, id) {
  const pathname = `contacts/${date}/${id}.json`;
  const blobs = await listAll(pathname);
  return blobs.some(blob => blob.pathname === pathname);
}

async function readContactsForDate(date) {
  const blobs = await listAll(`contacts/${date}/`);
  const records = [];
  const batchSize = 40;
  for (let i = 0; i < blobs.length; i += batchSize) {
    const batch = blobs.slice(i, i + batchSize);
    const items = await Promise.all(batch.map(async blob => {
      const value = await privateJson(blob.url);
      return value ? { ...value, id: blob.pathname.split('/').pop()?.replace(/\.json$/, '') || '' } : null;
    }));
    records.push(...items.filter(Boolean));
  }
  return records;
}

export async function allContacts() {
  const groups = await Promise.all(CONTACT_DATES.map(readContactsForDate));
  const records = groups.flat();
  records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return records;
}

export async function flyerMeta() {
  const blobs = await listAll(FLYER_META_PATH);
  const exact = blobs.find(blob => blob.pathname === FLYER_META_PATH);
  if (!exact) return null;
  const result = await get(exact.url, { access: 'public', useCache: false });
  if (!result || result.statusCode !== 200) return null;
  try {
    return await new Response(result.stream).json();
  } catch {
    return null;
  }
}
