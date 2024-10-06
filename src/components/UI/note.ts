import './styles/note.css';
import { parse, MfmNode } from 'mfm-js';
import { h, misskey, app } from '@/scripts';

function relativeTime(t: number) {
  let seconds = Math.ceil((new Date().getTime() - new Date(t).getTime()) / 1000);
  const units = [
    { time: 60, label: '秒' },
    { time: 60, label: '分' },
    { time: 24, label: '時間' },
    { time: 30, label: '日' },
    { time: 12, label: 'ヶ月' },
    { time: Infinity, label: '年' }
  ];

  for (let { time, label } of units) {
    if (seconds < time) return `${seconds}${label}`;
    seconds = Math.ceil(seconds / time);
  }
}

export function miNote(o: KuElementTagNameMap['mi-note']['options']) {
  const mfm = (t: nullable<string>): (InheritsFromNode | string | falsy)[] => {
    const N2D = (node: MfmNode): (InheritsFromNode | string | falsy) => {
      if (node.type === 'text') return h('span', node.props.text);
      else if (node.type === 'url') return h('a', { href: node.props.url }, ...(node.children ? node.children.map(N2D) : [node.props.url]));
      else if (node.type === 'hashtag') return h('a', { class: 'hashtag' }, node.props.hashtag);
      else if (node.type === 'emojiCode') {
        const emoji = misskey.emojis.search('name', node.props.name, instance);
        return emoji ? h('img', { src: emoji.url, class: 'emoji', loading: 'lazy' }) : h('span', node.props.name);
      }
    };

    return parse(t ?? '').map(N2D);
  };

  const userId = misskey.users.loginUser?.id;
  const i = misskey.users.loginUser?.i;
  const root = h('div', { class: ['mi-note', o.class].join(' ') }) as MisskeyNoteElement;
  const media: Record<string, HTMLElement> = {};
  const n: MisskeyNote = typeof o.note === 'string' ? JSON.parse(o.note) : o.note;
  const $n = n.renote && !n.text ? n.renote : n;
  const isQuote = o.class == 'renote' || o.class == 'reply';
  const instance = misskey.users.loginUser?.host as string;

  root.setAttribute('note-id', [n.id, $n.id].join(' '));
  root.$n = $n;

  const toggleClass = (elem: HTMLElement, className: string) => {
    elem.classList.toggle(className);
  };

  type ModalRow = { icon: string, contents: string, action: () => unknown };
  const genModal = (...row: (ModalRow | falsy)[]) => document.body.appendChild(h('m3-bottom-sheet', { class: 'note-modal', bg: true },
    ...row.filter((row): row is ModalRow => Boolean(row)).map(
      ({ icon, action, contents }) => h('m3-button', { type: 'text', onclick: action }, h('icon', { name: icon }), ...(Array.isArray(contents) ? contents : [contents]))
    ),
    h('m3-button', { onclick() { (<HTMLButtonElement>this).parentNode!.parentNode!.parentNode!.remove() } }, 'キャンセル')
  ));

  const favoriteBtn = h('button', {
    onclick() {
      const isFavorited = favoriteBtn.classList.contains('isFavorited');

      misskey.api.POST(`/notes/favorites/${isFavorited ? 'delete' : 'create'}`, { noteId: $n.id })
        .then(() => toggleClass(favoriteBtn, 'isFavorited'));
    },
    class: 'loading'
  }, h('icon', { name: 'bookmark' }));

  !isQuote && misskey.api.POST<{ isFavorited: boolean }>('notes/state', { i, noteId: $n.id })
    .then(({ isFavorited }) => favoriteBtn.classList.toggle('isFavorited', isFavorited));

  root.reaction = (e: string) => misskey.api.POST('notes/reactions/' + ($n.myReaction ? 'delete' : 'create'), {
    i, noteId: $n.id, reaction: e
  });

  root.renote = () => misskey.api.POST('notes/create', { i, renoteId: $n.id });
  root.removeNote = () => misskey.api.POST('notes/delete', { i, noteId: n.id });

  root.addReaction = (e: any) => {
    const button = reactions.qS(`button[name='${e.reaction}']`) || reactions.appendChild(
      h('button', { onclick: () => root.reaction(e.reaction), name: e.reaction }, h('img', { src: misskey.emojis.search('name', e.reaction, instance)?.url }), h('text', '0'))
    );
    button.childNodes[1].textContent = String(Number(button.childNodes[1].textContent) + 1);
    if (e.userId === userId) {
      button.classList.add('reacted');
      $n.myReaction = e.reaction;
    }
  };

  root.removeReaction = (e: any) => {
    const button = reactions.qS<HTMLButtonElement>(`button[name='${e.reaction}']`)!;
    button.childNodes[1].textContent = String(Number(button.childNodes[1].textContent) - 1);
    if (e.userId === userId) {
      button.classList.remove('reacted');
      $n.myReaction = null;
    }
    if (!Number(button.childNodes[1].textContent)) button.remove();
  };

  for (const f of $n.files) {
    const type = f.type.split('/')[0];

    // Idea 内部で変数'type'を使わなければ、コードを短くできる可能性
    if (!media[type]) media[type] = h('div', { class: `media ${type}`, style: `display: ${isQuote ? 'none' : ''}` });
    switch (type) {
      case 'image':
        const img = h('img', {
          src: f.thumbnailUrl, loading: 'lazy', decoding: 'async', onclick() {
            root.append(
              h('div', { class: 'popup', onclick() { (<HTMLElement>this).remove() } },
                h('img', { src: f.url, loading: 'lazy', decoding: 'async' })
              )
            );
          }
        });

        media['image'].append(
          f.isSensitive
            ? h('div', { class: 'sensitive', onclick() { (<HTMLElement>this).parentNode?.replaceChild(img, <HTMLElement>this) } },
              h('span', { class: 'material-symbols-outlined' }, 'visibility_off'),
              'センシティブなメディア'
            )
            : img
        );
        break;
      case 'audio':
        media['audio'].append(h('audio-player', { src: f.url }));
        break;
      default: break;
    }
  }

  if (n.renote) if (n.text) {
    root.quote = isQuote
      ? h('a', { href: app.host + '/notes/' + n.renote.id }, 'Quote...')
      : h('mi-note', { class: 'renote', note: n.renote })
  } else {
    root.renoter = h('p', { class: 'status renoter' },
      h('span', { class: 'name' },
        h('img', { src: n.user.avatarUrl, class: 'avater' }),
        ...mfm((n.user.name ?? n.user.username) + 'がﾘﾉｰﾄ'),
      ),
      h('span',
        h('button', {
          onclick() {
            const modal = genModal(userId == n.user.id ? {
              icon: 'delete',
              contents: 'リノート取り消し',
              action() { root.removeNote(); modal.remove() }
            } : {
              icon: 'report',
              contents: 'リノートを通報',
              // TODO 復活
              action() { /* app.toast.add({ contents: '未実装' }) */ }
            }, {
              icon: 'content_copy',
              contents: 'リンクをコピー',
              action() {
                if (navigator.clipboard) navigator.clipboard.writeText('/notes/' + n.id).then(
                  _ => app.toast.add({ contents: 'クリップボードにコピーしました。' })
                );
                else app.toast.add({ type: 'error', contents: '使えないみたい' })
                modal.remove();
              }
            })
          }
        }, h('span', { class: 'material-symbols-outlined' }, 'more_horiz')),
        relativeTime(n.createdAt) + '前'
      )
    );
  }

  const contents = h('div', { class: 'contents' },
    ...mfm($n.text),
    isQuote && $n.files[0] && h('p', {
      class: 'switchMedia', state: 'close', onclick() {
        const state = (<HTMLElement>this).getAttribute('state');
        (<HTMLElement>this).setAttribute('state', state === 'close' ? 'open' : 'close');
        [...(<HTMLElement>this).parentElement!.qSAll<HTMLElement>('.media')].forEach(
          e => e.style.display = state === 'close' ? '' : 'none'
        )
      }
    }, `${$n.files.length}コのファイル`),
    ...Object.values(media),
    root.quote
  );

  const cw = $n.cw && (
    (contents.style.display = 'none'),
    h('div', { class: 'cw' },
      ...mfm($n.cw),
      h('m3-button', {
        onclick() {
          if (cw) {
            const contentDiv = cw.qS<HTMLElement>('div.contents')!;
            const visibility = contentDiv.style.display === 'none'
            contentDiv.style.display = visibility ? '' : 'none';
            cw.qS('button')!.textContent = visibility ? 'もっと見る' : '隠す';
          };
        }
      }, 'もっと見る'),
      contents,
    )
  );

  const reactions = h('div', { class: 'reactions' },
    ...Object.entries((n.renote && !root.quote ? $n : n).reactions ?? {}).map(([e, c]) => {
      const
        isExternal = e.replaceAll(':', '').split('@')[1] !== '.',
        url = isExternal
          ? (n.renote && !root.quote ? $n : n).reactionEmojis[e.replaceAll(':', '')]
          : misskey.emojis.search('name', e, instance)?.url;

      return h('button', {
        onclick: () => !isExternal && root.reaction(e),
        name: e,
        class: [$n.myReaction == e && 'reacted', isExternal && 'external'].filter(v => v).join(' ')
      },
        url ? h('img', { src: url, class: isExternal }) : e, String(c)
      )
    })
  );

  root.append(
    h('header',
      root.renoter,
      $n.reply && !isQuote && h('mi-note', { class: 'reply', note: $n.reply })
    ),
    h('article',
      h('a', { href: '/@' + $n.user.username }, h('img', { src: $n.user.avatarUrl, class: 'avatar' })),
      h('div',
        h('p', { class: 'status' }, h('a', { class: 'name', href: '' }, ...mfm($n.user.name), ' @' + $n.user.username), h('a', { href: `/notes/${n.id}` }, relativeTime($n.createdAt) + '前')),
        cw ?? contents,
        !isQuote && reactions,
        !isQuote && h('footer',
          h('button', {
            onclick() {
              document.body.append(h('post-modal', { reply: n }))
            }
          }, h('icon', { name: 'mode_comment' })),
          h('button', {
            onclick() {
              const modal = genModal({
                icon: 'repeat',
                contents: 'リノート',
                action() { root.renote(); modal.remove() },
              }, {
                icon: 'format_quote',
                contents: '引用',
                action() { modal.remove(); document.body.append(h('post-modal', { quote: n })) },
              });
            }
          }, h('span', { class: 'material-symbols-outlined' }, 'repeat')),
          h('button', {
            onclick() {
              const modal = document.body.appendChild(h('m3-bottom-sheet', { class: 'emoji-pallet', bg: true }, h('mi-emoji-pallet', {
                emitter(e) {
                  root.reaction(`:${e.name}:`).then(() => modal.remove());
                }
              })))
            }
          }, h('span', { class: 'material-symbols-outlined' }, 'add')),
          h('button', {
            onclick() {
              const modal = genModal(userId === $n.user.id && {
                icon: 'edit',
                contents: '削除して編集',
                action() {
                  document.body.append(h('post-modal', {
                    replace: $n,
                    quote: root.quote && n.renote,
                    reply: $n.reply && !isQuote && $n.reply
                  }));
                  modal.remove();
                }
              }, userId === $n.user.id && {
                icon: 'delete',
                contents: 'ノートを削除',
                action() { misskey.api.POST('notes/delete', { i, noteId: $n.id }).then(_ => { modal.remove() }) }
              });
            }
          }, h('span', { class: 'material-symbols-outlined' }, 'more_horiz')),
          favoriteBtn,
          h('button', {
            onclick() {
              const modal = genModal({
                icon: 'content_copy',
                contents: 'リンクをコピー',
                action() {
                  if ('clipboard' in navigator) navigator.clipboard.writeText('/notes/' + n.id)
                    .then(
                      _ => app.toast.add({ contents: 'クリップボードにコピーしました。' })
                    )
                  else app.toast.add({ type: 'error', contents: '使えないみたい...' });
                  modal.remove()
                }
              }, {
                icon: 'share',
                contents: 'その他の方法でシェア',
                action() {
                  if (navigator.share) navigator.share({ url: '/notes/' + n.id })
                  else app.toast.add({ type: 'error', contents: '使えないみたい...' });
                  modal.remove()
                }
              }, {
                icon: 'format_quote',
                contents: 'ノートを引用',
                action() {
                  modal.remove();
                  document.body.append(h('post-modal', { quote: n }))
                }
              });
            }
          }, h('span', { class: 'material-symbols-outlined' }, 'share')),
        )
      )
    )
  );

  return root;
};
