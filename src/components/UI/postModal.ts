import './styles/post-modal.css'
import { h, misskey } from '@/scripts'

export function postModal(o: KuElementTagNameMap['post-modal']['options'] = {}) {
  function changeVisibility(select: HTMLButtonElement, value: 'public' | 'home' | 'followers' | 'direct') {
    if (select.firstElementChild) {
      select.value = value;
      select.replaceChild(h('icon', { name: { 'public': 'language', 'home': 'home', 'followers': 'group', 'direct': 'mail' }[value] }), select.firstElementChild);
    };
  }

  const
    quoteNote = o.quote && h('mi-note', { class: 'renote', note: o.quote }),
    replyNote = o.reply && h('mi-note', { class: 'renote', note: o.reply }),

    visibility = h('m3-button', {
      value: 'public', onclick() {
        const select = <HTMLButtonElement>this;
        const modal = document.body.appendChild(h('m3-bottom-sheet', { class: 'note-modal', bg: true },
          h('p', '公開範囲'),
          h('m3-button', { type: 'text', onclick() { changeVisibility(select, 'public'); modal.remove() } }, h('icon', { name: 'language' }), 'パブリック'),
          h('m3-button', { type: 'text', onclick() { changeVisibility(select, 'home'); modal.remove() } }, h('icon', { name: 'home' }), 'ホーム'),
          h('m3-button', { type: 'text', onclick() { changeVisibility(select, 'followers'); modal.remove() } }, h('icon', { name: 'group' }), 'ホーム'),
          h('m3-button', { type: 'text', onclick() { changeVisibility(select, 'direct'); modal.remove() } }, h('icon', { name: 'mail' }), 'ホーム'),
          h('m3-button', { onclick() { modal.remove() } }, 'キャンセル')
        ))
      }
    }, h('span', { class: 'material-symbols-outlined' }, 'language')),

    cwTextarea = h('textarea', { class: 'cw', placeholder: '注釈', style: 'display: none' }).on('keydown', e => e.key === 'Enter' && e.preventDefault()),
    textarea = h('textarea', { placeholder: o.quote ? '引用...' : o.reply ? '返信...' : '今どうしてる？' }),
    media = h('div', { class: 'media' }),
    modal = h('div', { id: 'post-popup', onclick({ target }) { if (target == modal) modal.remove() } },
      h('div', { class: 'root' },
        h('div', { class: 'head' }, h('icon', { name: 'close', onclick() { modal.remove() } }),),
        quoteNote, replyNote, cwTextarea, textarea, media,
        h('div', { class: 'footer' },
          h('div',
            h('m3-button', {
              type: 'text', onclick() {
                const modal = document.body.appendChild(h('m3-bottom-sheet', { class: 'note-modal', bg: true },
                  h('p', '添付'),
                  h('m3-button', {
                    type: 'text',
                    onclick() {
                      const input = h('input', { type: 'file' });
                      input.on('change', () => {
                        if (input.files) for (const file of input.files) {
                          const form = new FormData();
                          // @ts-ignore
                          form.set('force', true);
                          form.set('file', file);
                          form.set('name', file.name);

                          misskey.api.POST<{ id: string, isSensitive: boolean, thumbnailUrl: string }>('drive/files/create', form).then(
                            ({ id, isSensitive, thumbnailUrl }) => {
                              media.appendChild(h('img', {
                                src: thumbnailUrl, fileId: id, isSensitive, onclick() {
                                  const file = <HTMLImageElement>this;
                                  const isSensitive = file.getAttribute('isSensitive') === 'true';

                                  const modal = document.body.appendChild(h('m3-bottom-sheet', { class: 'note-modal', bg: true },
                                    h('m3-button', {
                                      type: 'text', onclick() { }
                                    }, h('icon', { name: 'border_color' }), '名前を変更'),
                                    h('m3-button', {
                                      type: 'text', onclick() {
                                        misskey.api.POST('drive/files/update', { fileId: id, isSensitive: !isSensitive, }).then(
                                          _ => { modal.remove(); file.setAttribute('isSensitive', `${!isSensitive}`) }
                                        );
                                      }
                                    }, h('icon', { name: isSensitive ? 'visibility' : 'visibility_off' }), isSensitive ? 'センシティブ解除' : 'センシティブとする'),
                                    h('m3-button', { type: 'text', onclick() { file.remove(); modal.remove() } }, h('icon', { name: 'undo' }), '添付取り消し'),
                                    h('m3-button', {
                                      type: 'text', onclick() {
                                        modal.remove(); misskey.api.POST('drive/files/delete', { fileId: id }).then(() => file.remove())
                                      }
                                    }, h('icon', { name: 'delete' }), 'ドライブから削除'),
                                    h('m3-button', { onclick() { modal.remove() } }, 'キャンセル')
                                  ))
                                }
                              }))
                            }
                          );
                        }

                        modal.remove();
                      }).click();
                    }
                  }, h('icon', { name: 'cloud_upload' }), 'アップロード'),
                  h('m3-button', { onclick() { modal.remove() } }, 'キャンセル')
                ))
              }
            }, h('icon', { name: 'photo_library' })),
            // TODO 投票
            // h('m3-button', { type: 'text' }, h('icon', { name: 'bar_chart', onclick() { } })),
            h('m3-button', { type: 'text', onclick() { cwTextarea.style.display = cwTextarea.style.display == 'none' ? '' : 'none' } }, h('icon', { name: 'visibility_off' })),
            visibility
          ),
          h('m3-button', {
            onclick() {
              if (textarea.value !== '') {
                modal.remove();

                misskey.api.POST('notes/create', {
                  cw: cwTextarea.style.display != 'none' ? cwTextarea.value : undefined,
                  text: textarea.value,
                  visibility: visibility.value,
                  ...(media.childNodes[0] && { fileIds: [...media.childNodes].map(e => (<HTMLImageElement>e).getAttribute('fileId')) }),
                  ...(o.quote && { renoteId: (o.quote.text ? o.quote : o.quote.renote)?.id }),
                  ...(o.reply && { replyId: (o.reply.text ? o.quote : o.reply.renote)?.id })
                })
                  .then(_ => o.replace && misskey.api.POST('notes/delete', { noteId: o.replace.id }));
              }
            }
          }, '投稿', h('icon', { name: 'stylus_note' }))
        ),
      )
    );

  if (o.replace) {
    cwTextarea.value = o.replace.cw ?? '';
    textarea.value = o.replace.text ?? '';
  }

  return modal;
}