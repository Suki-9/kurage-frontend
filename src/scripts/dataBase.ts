const tableNames = [
  'emojis', 'users', 'instances'
] as const;

export const IDB = {
  open: async () => new Promise<IDBDatabase>(r => {
    const $ = indexedDB.open('key-value', 1);

    $.onsuccess = () => r($.result);
    $.onupgradeneeded = () => {
      const objectStoreNames = [...$.result.objectStoreNames];
      for (const tableName of tableNames) if (!objectStoreNames.includes(tableName)) $.result.createObjectStore(tableName, { keyPath: 'key' })
    };
  }),
  put: async (storeName: Values<typeof tableNames>, { key, val }: { key: string, val: any }) => new Promise<void>(
    (resolve, reject) => IDB
      .open()
      .then(db => {
        const $ = db.transaction(storeName as string, 'readwrite').objectStore(storeName as string).put({ key, val });
        $.onsuccess = () => resolve()
        $.onerror = () => reject()
      })
  ),
  get: async <R>(storeName: Values<typeof tableNames>, key: string) => new Promise<R>(
    (resolve, reject) => IDB
      .open()
      .then(db => {
        const $ = key === '*'
          ? db.transaction(storeName as string, 'readwrite').objectStore(storeName as string).getAll()
          : db.transaction(storeName as string, 'readwrite').objectStore(storeName as string).get(key);

        $.onsuccess = () => resolve(key === '*' ? $.result : $.result && 'val' in $.result ? $.result.val : null)
        $.onerror = () => reject()
      })
  )
}