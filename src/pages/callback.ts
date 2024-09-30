import './styles/callback.css'
import { h, cookie, misskey, IDB } from "@/scripts"

export function Page(): InheritsFromNode[] {
  const instance = cookie.read('instance');

  if (instance) fetch(
    `${instance}/api/miauth/${Object.fromEntries(location.search.replace('?', '').split('&').map($ => $.split('='))).session}/check`, { method: "POST" }
  )
    .then(async r => {
      const { token, user, ok } = await r.json();

      if (ok) {
        user['i'] = token;
        await IDB.put({ key: [instance, user.id].join('::'), val: user });
        if (!(await IDB.get(`${instance}::emojis`))) {
          await misskey.emojis.init(instance);
        }
      } else { }
      // location.href = '/';
    });
  else location.href = '/login';

  return [h('p', { style: 'text-align: center;' }, '少し待ってね')];
};