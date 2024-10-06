import './styles/note.css';
import { parse, MfmNode } from 'mfm-js';
import { h, misskey, app } from '@/scripts';

function relativeTime(t: number) {
  return (t = Math.ceil((new Date().getTime() - new Date(t).getTime()) / 1000)) < 60 ? t + '秒' : (t = Math.ceil(t / 60)) < 60 ? t + '分' : (t = Math.ceil(t / 60)) < 24 ? t + '時間' : (t = Math.ceil(t / 24)) < 30 ? t + '日' : (t = Math.ceil(t / 30)) < 12 ? t + 'ヶ月' : (t = Math.ceil(t / 12)) ? '年' : null
}

export function miNote(o: KuElementTagNameMap['mi-note']['options']) {
  const textCopy = (text: string) => {
    if ('clipboard' in navigator) navigator.clipboard.writeText(text).then(
      _ => app.toast.add({ contents: 'クリップボードにコピーしました。' })
    )
    else app.toast.add({ type: 'error', contents: '使えないみたい...' })
  }
  const genModal = (...row: ({ icon: string, contents: string, action: () => unknown } | falsy)[]) => {
    const modal = document.body.appendChild(h('m3-bottom-sheet', { class: 'note-modal', bg: true },
      ...row.filter((row): row is { icon: string, contents: string, action: () => unknown } => Boolean(row)).map(
        ({ icon, action, contents }) => h('m3-button', { type: 'text', onclick: action }, h('icon', { name: icon }), ...(Array.isArray(contents) ? contents : [contents]))
      ),
      h('m3-button', { onclick() { modal.remove() } }, 'キャンセル')
    ));
    return modal;
  };
  const apiCall = misskey.api.POST;
  const mfm = (t: nullable<string>): (InheritsFromNode | string | falsy)[] => {
    const N2D = (node: MfmNode): (InheritsFromNode | string | falsy) => {
      if (node.type === 'text') return h('span', node.props.text);
      else if (node.type === 'url') return h('a', { href: node.props.url }, ...(node.children ? node.children.map(N2D) : [node.props.url]));
      else if (node.type === 'hashtag') return h('a', { class: 'hashtag' }, node.props.hashtag);
      else if (node.type === 'emojiCode') {
        const emoji = misskey.emojis.search('name', node.props.name);
        return emoji ? h('img', {
          src: emoji.url, class: 'emoji', loading: 'lazy', onclick() {
            const modal = document.body.appendChild(genModal(
              { icon: 'content_copy', contents: 'コピー', action() { textCopy(emoji.name); modal.remove() } },
              { icon: 'add', contents: 'リアクションする', action() { root.reaction(emoji.name); modal.remove() } },
              { icon: 'info', contents: '情報', action() { } }
            ))
          }
        }) : h('span', node.props.name);
      }
    };

    return parse(t ?? '').map(N2D);
  };

  const
    n: MisskeyNote = typeof o.note === 'string' ? JSON.parse(o.note) : o.note,
    $n: MisskeyNote = n.renote && !n.text ? n.renote : n,

    userId = misskey.users.loginUser?.id,
    isQuote = o.class == 'renote' || o.class == 'reply',

    root = <MisskeyNoteElement>h('div', { class: ['mi-note', o.class].join(' ') }),
    media: Record<string, HTMLElement> = {};

  root.setAttribute('note-id', [n.id, $n.id].join(' '));
  root.$n = $n;

  const favoriteBtn = h('button', {
    onclick() {
      const isFavorited = favoriteBtn.classList.contains('isFavorited');
      apiCall(`notes/favorites/${isFavorited ? 'delete' : 'create'}`, { noteId: $n.id }).then(() => favoriteBtn.classList.toggle('isFavorited'));
    }, class: 'loading'
  }, h('icon', { name: 'bookmark' }));

  !isQuote && apiCall<{ isFavorited: boolean }>('notes/state', { noteId: $n.id }).then(
    ({ isFavorited }) => isFavorited ? favoriteBtn.setAttribute('class', 'isFavorited') : favoriteBtn.removeAttribute('class')
  );

  root.renote = () => apiCall('notes/create', { renoteId: $n.id });
  root.removeNote = () => apiCall('notes/delete', { noteId: n.id });
  root.reaction = async (e: string) => {
    const d = () => apiCall('notes/reactions/delete', { noteId: $n.id, reaction: $n.myReaction });
    const c = () => apiCall('notes/reactions/create', { noteId: $n.id, reaction: e }).then(() => $n.myReaction = e);

    (e = e.match(/:.+:/) ? e.replace('@.', '') : `:${e.replace('@.', '')}:`) === ($n.myReaction = $n.myReaction?.replace('@.', ''))
      ? d()
      : $n.myReaction
        ? document.body.append(h('m3-modal', { type: 'warning', actions: { OK() { d().then(c) } } }, 'リアクションを変更しますか？'))
        : c();
  };

  root.addReaction = (e: MisskeyReaction) => {
    const button = reactions.qS<HTMLButtonElement>(`button[name='${e.reaction}']`) || reactions.appendChild(
      h('button', { onclick: () => root.reaction(e.reaction), name: e.reaction }, h('img', { src: misskey.emojis.search('name', e.reaction)?.url }), h('text', '0'))
    );
    button.childNodes[1].textContent = String(Number(button.childNodes[1].textContent) + 1);
    if (e.userId === userId) {
      button.classList.add('reacted');
      $n.myReaction = e.reaction;
    }
  };

  root.removeReaction = (e: any) => {
    const button = reactions.qS<HTMLButtonElement>(`button[name='${e.reaction}']`);
    if (button) {
      button.childNodes[1].textContent = String(Number(button.childNodes[1].textContent) - 1);
      if (e.userId === userId) {
        button.classList.remove('reacted');
        $n.myReaction = null;
      }
      if (!Number(button.childNodes[1].textContent)) button.remove();
    }
  };

  for (const f of $n.files) {
    const type = f.type.split('/')[0];

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
      case 'audio': media['audio'].append(h('audio-player', { src: f.url })); break;
      default: break;
    }
  }

  if (n.renote) n.text
    ? root.quote = isQuote
      ? h('a', { href: app.host + '/notes/' + n.renote.id }, 'Quote...')
      : h('mi-note', { class: 'renote', note: n.renote })
    : root.renoter = h('p', { class: 'status renoter' },
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
              action() { }
            }, {
              icon: 'content_copy',
              contents: 'リンクをコピー',
              action() { textCopy('/notes/' + n.id); modal.remove() }
            })
          }
        }, h('span', { class: 'material-symbols-outlined' }, 'more_horiz')),
        relativeTime(n.createdAt) + '前'
      )
    );

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

  const cw = <HTMLDivElement>($n.cw && (
    (contents.style.display = 'none'),
    h('div', { class: 'cw' },
      ...mfm($n.cw),
      h('m3-button', {
        onclick() {
          const visibility = contents.style.display !== 'none';
          contents.style.display = visibility ? 'none' : '';
          (<HTMLButtonElement>this).textContent = visibility ? 'もっと見る' : '隠す';
        }
      }, 'もっと見る'),
      contents,
    )
  ));

  const reactions = h('div', { class: 'reactions' },
    ...Object.entries((n.renote && !root.quote ? $n : n).reactions ?? {}).map(([e, c]) => {
      const
        isExternal = e.replaceAll(':', '').split('@')[1] !== '.',
        url = isExternal
          ? (n.renote && !root.quote ? $n : n).reactionEmojis[e.replaceAll(':', '')]
          : misskey.emojis.search('name', e)?.url;

      return h('button', {
        onclick: () => !isExternal && root.reaction(e),
        name: e,
        class: [$n.myReaction == e && 'reacted', isExternal && 'external'].filter(v => v).join(' ')
      }, url ? h('img', { src: url, class: isExternal }) : e, String(c));
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
        h('p', { class: 'status' },
          h('a', { class: 'name', href: '@' + $n.user.username }, ...mfm($n.user.name), '  @' + $n.user.username),
          h('a', { href: `/notes/${n.id}` }, relativeTime($n.createdAt) + '前')
        ),
        cw ?? contents,
        !isQuote && reactions,
        !isQuote && h('footer',
          h('button', { onclick() { document.body.append(h('post-modal', { reply: n })) } }, h('icon', { name: 'mode_comment' })),
          h('button', {
            onclick() {
              const modal = genModal(
                { icon: 'repeat', contents: 'リノート', action() { root.renote(); modal.remove() } },
                { icon: 'format_quote', contents: '引用', action() { document.body.append(h('post-modal', { quote: n })); modal.remove(); } }
              )
            }
          }, h('icon', { name: 'repeat' })),
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
              const modal = genModal(
                userId === $n.user.id && {
                  icon: 'edit', contents: '削除して編集', action() {
                    document.body.append(h('post-modal', {
                      replace: $n,
                      quote: root.quote && n.renote,
                      reply: $n.reply && !isQuote && $n.reply
                    }));
                    modal.remove();
                  }
                },
                userId === $n.user.id && { icon: 'delete', contents: 'ノートを削除', action() { apiCall('notes/delete', { noteId: $n.id }).then(_ => { modal.remove() }) } }
              );
            }
          }, h('icon', { name: 'more_horiz' })),
          favoriteBtn,
          h('button', {
            onclick() {
              const modal = genModal(
                { icon: 'content_copy', contents: 'リンクをコピー', action() { textCopy('/notes/' + n.id); modal.remove() } },
                {
                  icon: 'share', contents: 'その他の方法でシェア', action() {
                    if (navigator.share) navigator.share({ url: '/notes/' + n.id })
                    else app.toast.add({ type: 'error', contents: '使えないみたい...' })
                    modal.remove()
                  }
                }, {
                icon: 'format_quote', contents: 'ノートを引用', action() {
                  modal.remove();
                  document.body.append(h('post-modal', { quote: n }))
                }
              });
            }
          }, h('icon', { name: 'share' }))
        )
      )
    )
  );

  return root;
};
