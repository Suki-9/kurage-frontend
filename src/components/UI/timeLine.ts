import './styles/timeline.css'
import { h, misskey, router } from "@/scripts"

async function waitQuerySelector(selector: string, node = document): Promise<HTMLElement> {
  let obj: nullable<HTMLElement> = null;

  while (!obj) obj = await new Promise(r => setTimeout(() => r(node.qS<HTMLElement>(selector)), 100));

  return obj;
}

export function timeLine(o: KuElementTagNameMap['timeline']['options']) {
  function switchTL(channel: string) { }

  const height = window.innerHeight;

  const loginUser = misskey.users.loginUser;
  const root = h('div', { class: 'timeline', style: `height: ${height}px` },
    h('div', { class: 'head' },
      h('img', {
        src: loginUser?.avatarUrl, onclick() {
          const modal = document.body.appendChild(h('m3-bottom-sheet', { class: 'share-modal', bg: true },
            h('m3-button', { type: 'text', onclick() { location.href = '/@' + loginUser?.username } }, h('img', { class: 'icon', src: loginUser?.avatarUrl },), 'プロフィール'),
            h('m3-button', { onclick() { modal.remove() } }, '閉じる')
          ))
        }
      }),
      h('div',
        h('m3-button', { type: 'text', onclick() { switchTL('home') } }, h('span', { class: 'material-symbols-outlined' }, 'home'), 'ホーム'),
        h('m3-button', { type: 'text', onclick() { switchTL('local') } }, h('span', { class: 'material-symbols-outlined' }, 'language'), 'ローカル'),
        h('m3-button', { type: 'text', onclick() { switchTL('hybrid') } }, h('span', { class: 'material-symbols-outlined' }, 'diversity_3'), 'ソーシャル'),
        h('m3-button', { type: 'text', onclick() { switchTL('global') } }, h('span', { class: 'material-symbols-outlined' }, 'public'), 'グローバル')
      )
    ),
    h('div', { id: 'timeline' })
  )

  waitQuerySelector('#timeline').then(async root => {
    if (!loginUser) router.routing('/login');

    const
      channel = 'homeTimeline',
      stream = await misskey.stream.streamConnection(channel);

    if (stream.readyState === 1) {

      stream.onmessage = function (e) {
        const event = <MisskeyStreamEvent>JSON.parse(e.data);

        if (event.type === 'noteUpdated')
          [...root.qSAll<MisskeyNoteElement>('*[note-id~="' + event.body.id + '"]')].map(
            note => {
              if (event.body.type === 'reacted') note.addReaction(event.body.body);
              else if (event.body.type === 'unreacted') note.removeReaction(event.body.body);
              else if (event.body.type === 'deleted') note.remove()
            }
          );
        else if (event.type === 'channel')
          if (event.body.type === 'note') {
            stream.subNote(event.body.body.id);
            root.prepend(h('mi-note', { note: event.body.body }));
          }
      }

      for (const note of (await misskey.api.POST<MisskeyNote[]>(`notes/${channel === 'homeTimeline' ? 'timeline' : channel}`, {}))) {
        stream.subNote(note.id);
        root.append(h('mi-note', { note }));
      };
    }
  })

  return root;
}