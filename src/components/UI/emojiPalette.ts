import './styles/emoji-pallet.css'
import { h, misskey } from "@/scripts"

export function emojiPallte(o: KuElementTagNameMap['mi-emoji-pallet']['options']) {
  function _h(i: CategorizedIndex) {
    return Object.entries(i).map(([c, o]) =>
      c == '$' && Array.isArray(o)
        ? h('div', { class: 'emojis' }, ...o.map($ => h('button', { onclick: (() => emit($)) }, h('img', { src: $.url, alt: $.name, loading: 'lazy', decoding: 'async' }))))
        : ($ => ($.qS('&>a')?.on('click', _ => {
          const t = $.qS('&>div');
          t?.setAttribute('class', t.getAttribute('class') == 'open' ? '' : 'open');
        }), $)
        )(h('div', { class: 'folder' },
          h('a', c),
          h('div', ..._h(o as CategorizedIndex))
        ))
    );
  }

  let searchResult: MisskeyEmoji[] = [];
  const input = h('input', { type: 'text' });

  input.on('input', () => {
    searchResult = input.value === ''
      ? []
      : misskey.emojis.search('aliases', input.value, misskey.users.loginUser!.host);

    root.qS('.result')?.removeChildren();
    root.qS('.result')?.append(
      ...searchResult.slice(0, 50).map($ => h('button', { onclick: (() => emit($)) }, h('img', { src: $.url, alt: $.name, loading: 'lazy', decoding: 'async' })))
    );
  })

  const
    emojis = misskey.emojis.get(misskey.users.loginUser!.host, 'categorized')!,
    attr = typeof o === 'object' && !(o instanceof Element) ? o : {},
    emit = (e: MisskeyEmoji) => attr.emitter && attr.emitter(e),
    root = h('div', { class: 'emoji-pallet' },
      input,
      h('div', { class: 'result' }),
      ..._h(emojis)
    );

  return root;
}
