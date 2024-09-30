export const store = {
  set: (key: string, val: any) => localStorage.setItem(key, val),
  get: (key: string) => localStorage.getItem(key),
  del: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
}