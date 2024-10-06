import './styles/callback.css'
import { h, cookie, misskey, store } from "@/scripts"

export function Page(): InheritsFromNode[] {
  document.qS(':root')?.removeAttribute('page');

  const instance = cookie.read('instance');
  const session = Object.fromEntries(location.search.replace('?', '').split('&').map($ => $.split('='))).session;

  if (instance && session) fetch(`${instance}/api/miauth/${session}/check`, { method: 'POST' }).then(
    async r => {
      const { token, user, ok }: { token: string, user: MisskeyUser, ok: boolean } = await r.json();
      if (ok) {
        user.host = instance;
        user.i = token;

        store.set('loginUser', `${instance}::${user.id}`);

        await misskey.users.add(instance, user);
        await misskey.emojis.add(instance);
      }

      location.href = '/';
    }
  );

  return [h('p', { style: 'text-align: center;' }, '少し待ってね')];
};
