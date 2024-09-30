export const IDB = {
  open: async () => new Promise<IDBDatabase>(r => {
    const $ = indexedDB.open('store', 1);
    $.onupgradeneeded = () => [...$.result.objectStoreNames].includes('key-value') || $.result.createObjectStore('key-value', { keyPath: 'key' });
    $.onsuccess = () => r($.result)
  }),
  put: async (value: { key: string, val: any }) => new Promise<void>(
    (resolve, reject) => IDB
      .open()
      .then(db => {
        const $ = db.transaction('key-value', 'readwrite').objectStore('key-value').put(value);
        $.onsuccess = () => resolve()
        $.onerror = () => reject()
      })
  ),
  get: async <R>(key: string) => new Promise<R>(
    (resolve, reject) => IDB
      .open()
      .then(db => {
        const $ = db.transaction('key-value', 'readwrite').objectStore('key-value').get(key)
        $.onsuccess = () => resolve($.result && 'val' in $.result ? $.result.val : null)
        $.onerror = () => reject()
      })
  )
}