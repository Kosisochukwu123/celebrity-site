// imageCache.js — IndexedDB-backed image cache
// Stores data URIs so gallery/content images load instantly after first view
// Works transparently — call getCachedImage(url) everywhere instead of using urls directly

const DB_NAME    = 'sterling-img-cache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let db = null;

const openDB = () => new Promise((resolve, reject) => {
  if (db) return resolve(db);
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = (e) => {
    const store = e.target.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    store.createIndex('ts', 'ts');
  };
  req.onsuccess = (e) => { db = e.target.result; resolve(db); };
  req.onerror   = () => reject(req.error);
});

// Store an image URL → data URI mapping
export const cacheImage = async (url, dataUri) => {
  if (!url || !dataUri) return;
  // Only cache data URIs (base64) — not external URLs which browsers cache natively
  if (!dataUri.startsWith('data:')) return;
  try {
    const database = await openDB();
    const tx    = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key: url, dataUri, ts: Date.now() });
  } catch { /* silent */ }
};

// Get a cached image — returns the cached data URI or null
export const getCachedImage = async (url) => {
  if (!url) return null;
  // Data URIs are already inline — no caching needed, return as-is
  if (url.startsWith('data:')) return url;
  try {
    const database = await openDB();
    const tx    = database.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.get(url);
      req.onsuccess = () => {
        const result = req.result;
        if (!result) return resolve(null);
        // Expire old cache entries
        if (Date.now() - result.ts > MAX_AGE_MS) return resolve(null);
        resolve(result.dataUri);
      };
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
};

// Prune old entries (call on app startup)
export const pruneCache = async () => {
  try {
    const database = await openDB();
    const tx       = database.transaction(STORE_NAME, 'readwrite');
    const store    = tx.objectStore(STORE_NAME);
    const index    = store.index('ts');
    const cutoff   = Date.now() - MAX_AGE_MS;
    const range    = IDBKeyRange.upperBound(cutoff);
    const req      = index.openCursor(range);
    req.onsuccess  = (e) => {
      const cursor = e.target.result;
      if (cursor) { cursor.delete(); cursor.continue(); }
    };
  } catch { /* silent */ }
};