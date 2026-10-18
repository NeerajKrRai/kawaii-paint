// ── Saved paintings live in IndexedDB (images are too big for localStorage) ──
// Everything stays on this device. No server, no network.
const DB_NAME = 'kawaii-paint';
const STORE = 'drawings';
let _dbp = null;

function dbReady() {
  if (_dbp) return _dbp;
  _dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbp;
}

function _tx(mode) {
  return dbReady().then(db => db.transaction(STORE, mode).objectStore(STORE));
}

function addDrawing(rec) {
  return _tx('readwrite').then(os => new Promise((res, rej) => {
    const r = os.add(rec);
    r.onsuccess = () => res(rec);
    r.onerror = () => rej(r.error);
  }));
}

function getAllDrawings() {
  return _tx('readonly').then(os => new Promise((res, rej) => {
    const r = os.getAll();
    r.onsuccess = () => res((r.result || []).sort((a, b) => b.id - a.id)); // newest first
    r.onerror = () => rej(r.error);
  }));
}

function deleteDrawing(id) {
  return _tx('readwrite').then(os => new Promise((res, rej) => {
    const r = os.delete(id);
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  }));
}

function countDrawings() {
  return _tx('readonly').then(os => new Promise((res, rej) => {
    const r = os.count();
    r.onsuccess = () => res(r.result || 0);
    r.onerror = () => rej(r.error);
  }));
}
