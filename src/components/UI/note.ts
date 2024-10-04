import './styles/note.css';
import { h, misskey, app } from '@/scripts';

function relativeTime(t: number) {
  return (t = Math.ceil((new Date().getTime() - new Date(t).getTime()) / 1000)) < 60 ? t + '秒' : (t = Math.ceil(t / 60)) < 60 ? t + '分' : (t = Math.ceil(t / 60)) < 24 ? t + '時間' : (t = Math.ceil(t / 24)) < 30 ? t + '日' : (t = Math.ceil(t / 30)) < 12 ? t + 'ヶ月' : (t = Math.ceil(t / 12)) ? '年' : null
}

export function miNote(o: KuElementTagNameMap['mi-note']['options']) {
  // TODO MFM.js
  const mfm = (t: nullable<string>) => [t];

  // TODO iconの型
  type ModalRow = { icon: string, contents: string, action: () => unknown };
  const genModal = (...row: (ModalRow | falsy)[]) => document.body.appendChild(h('m3-bottom-sheet', { class: 'note-modal', bg: true },
    ...row.filter((row): row is ModalRow => Boolean(row)).map(
      ({ icon, action, contents }) => h('m3-button', { type: 'text', onclick: action }, h('icon', { name: icon }), ...(Array.isArray(contents) ? contents : [contents]))
    ),
    h('m3-button', { onclick() { (<HTMLButtonElement>this).parentNode!.parentNode!.parentNode!.remove() } }, 'キャンセル')
  ));

  // OK
  const userId = misskey.users.loginUser?.id;
  const i = misskey.users.loginUser?.i;
  const root = h('div', { class: ['mi-note', o.class].join(' ') }) as MisskeyNoteElement;
  const media: Record<string, HTMLElement> = {};
  const n: MisskeyNote = typeof o.note === 'string' ? JSON.parse(o.note) : o.note;
  const $n = n.renote && !n.text ? n.renote : n;
  const isQuote = o.class == 'renote' || o.class == 'reply';

  const instance = misskey.users.loginUser?.instance?.origin as string;

  // Change! noteid => note-id
  root.setAttribute('note-id', [n.id, $n.id].join(' '));
  root.$n = $n;

  // OK
  const favoriteBtn = h('button', {
    onclick() {
      const state = favoriteBtn.getAttribute('class');

      misskey.api.POST('/notes/favorites/' + (state === 'isFavorited' ? 'delete' : 'create'), { noteId: $n.id })
        .then(_ => {
          state === 'isFavorited' ? favoriteBtn.removeAttribute('class') : favoriteBtn.setAttribute('class', 'isFavorited');
        })
    }, class: 'loading'
  }, h('icon', { name: 'bookmark' }));

  !isQuote && misskey.api.POST<{ isFavorited: boolean }>('notes/state', {
    i, noteId: $n.id
  }).then(
    ({ isFavorited }) => favoriteBtn.setAttribute('class', isFavorited ? 'isFavorited' : '')
  )

  root.switchCw = function () {
    [
      root.cw.qS<HTMLElement>('div.contents')!.style.display,
      root.cw.qS('button')!.innerHTML
    ] = root.cw.qS<HTMLElement>('div.contents')!.style.display == 'none' ? ['', '隠す'] : ['none', 'もっと見る'];
  };

  root.reaction = e => misskey.api.POST('notes/reactions/' + ($n.myReaction ? 'delete' : 'create'), {
    i, noteId: $n.id, reaction: e
  });

  root.renote = () => misskey.api.POST('notes/create', {
    i, renoteId: $n.id,
  });

  root.removeNote = () => misskey.api.POST('notes/delete', {
    i, noteId: n.id,
  });

  root.addReaction = e => {
    const $ = root.reactions.qS(`button[name='${e.reaction}']`) ?? root.reactions.appendChild(
      h('button', {
        onclick: (() => root.reaction(e.reaction)),
        name: e.reaction,
        class: e.userId == userId && 'reacted'
      },
        ($ => $ ? h('img', { src: $.url }) : h('text', e.reaction))(misskey.emojis.search('name', e.reaction, instance)),
        h('text', '0')
      )
    );

    $.childNodes[1].textContent = String(Number($.childNodes[1].textContent) + 1);

    if (e.userId == userId) {
      $.setAttribute('class', 'reacted');
      $n.myReaction = e.reaction;
    };
  }

  root.removeReaction = e => {
    const $ = root.reactions.qS<HTMLButtonElement>(`button[name='${e.reaction}']`)!;

    $.childNodes[1].textContent = String(Number($.childNodes[1].textContent) - 1);

    if (e.userId == userId) {
      $.setAttribute('class', '');
      $n.myReaction = null;
    }

    if (!Number($.childNodes[1].textContent)) $.remove();
  }

  for (const f of $n.files) {
    const type = f.type.split('/')[0];

    if (!media[type]) media[type] = h('div', { class: ['media', type].join(' '), style: `display: ${isQuote ? 'none' : ''}` });
    if (type === 'image') {
      const $ = h('img', {
        src: f.thumbnailUrl, loading: 'lazy', onclick() {
          root.appendChild(
            h('div', { class: 'popup', onclick() { (<HTMLElement>this).remove() } },
              h('img', { src: f.url, }),
            )
          )
        }
      });
      media[type].append(
        f.isSensitive
          ? h('div', { class: 'sensitive', onclick() { (<HTMLElement>this).parentNode?.replaceChild($, <HTMLElement>this) } },
            h('span', { class: 'material-symbols-outlined' }, 'visibility_off'),
            'センシティブなメディア'
          )
          : $
      );
    } else if (type === 'audio') {
      media[type].append(h('audio-player', { src: f.url }));
    }
  }

  for (const dom of Object.values(media)) {
    dom.setAttribute('class', [dom.getAttribute('class'), `items${dom.childNodes.length}`].join(' '))
  }

  if (n.renote) if (n.text) {
    root.quote = isQuote
      ? h('a', { href: app.host + '/notes/' + n.renote.id }, 'Quote...')
      : h('mi-note', { class: 'renote', note: n.renote })
  } else {
    root.renoter = h('p', { class: 'status renoter' },
      h('span',
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

    if (n.renote.renote) isQuote
      ? h('a', { href: '/notes/' + n.renote.renote.id }, 'Quote...')
      : h('mi-note', { note: n.renote.renote, class: 'renote' })
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

  if ($n.cw) {
    contents.style.display = 'none';
    root.cw = h('div', { class: 'cw' },
      ...mfm($n.cw),
      h('m3-button', { onclick: root.switchCw }, 'もっと見る'),
      contents,
    );
  }

  root.reactions = h('div', { class: 'reactions' },
    ...Object.entries((n.renote && !root.quote ? $n : n).reactions ?? {}).map(([e, c]) =>
      h('button', {
        onclick: () => root.reaction(e),
        name: e,
        class: $n.myReaction == e && 'reacted'
      },
        ($ => $ ? h('img', { src: $.url }) : e)(misskey.emojis.search('name', e, instance)), String(c)
      )
    )
  );

  root.append(
    h('header',
      root.renoter,
      $n.reply && !isQuote && h('mi-note', { class: 'reply', note: $n.reply })
    ),
    h('article',
      h('a', { href: '/@' + $n.user.username },
        h('img', { src: $n.user.avatarUrl, class: 'avatar' })
      ),
      h('div',
        h('p', { class: 'status' },
          h('span', { class: 'name' }, ...mfm($n.user.name), ' @' + $n.user.username),
          h('span', { onclick() { location.href = `/notes/${n.id}` } }, relativeTime($n.createdAt) + '前')
        ),
        root.cw ?? contents,
        !isQuote && root.reactions,
        !isQuote && h('footer',
          h('button', {
            onclick() {
              document.body.append(h('mi-post-modal', { reply: n }))
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
                action() { modal.remove(); document.body.append(h('mi-post-modal', { quote: n })) },
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
                  console.log(isQuote)
                  document.body.append(h('mi-post-modal', {
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
                  document.body.append(h('mi-post-modal', { quote: n }))
                }
              });
            }
          }, h('span', { class: 'material-symbols-outlined' }, 'share')),
        )
      )
    ),
  );

  return root;
};