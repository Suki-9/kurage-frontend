type CookieUtils = {
  index: null | Record<string, string>,
  updateIndex: () => Record<string, string>;
  read: (k: string) => string | undefined;
  write: (k: string, v: string) => void;
  delete: (k: string) => void;
};

export const cookie: CookieUtils = {
  index: null,
  updateIndex: () => cookie.index = Object.fromEntries(document.cookie.split('; ').map(e => e.split('='))),
  read: (k) => cookie.index ? cookie.index[k] : cookie.updateIndex()[k],
  write(k, v) { document.cookie = `${k}=${v}`, cookie.updateIndex() },
  delete(k) { document.cookie = `${k}=;max-age=0`, cookie.updateIndex() },
}