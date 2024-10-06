import './styles/notes.css'
import { h, misskey } from '@/scripts'

export function Page(): InheritsFromNode[] {
  document.qS(':root')?.setAttribute('page', 'notes');

  const noteId = location.pathname.split('/')[2];

  const root = h('div', {
    class: 'page-root'
  }, h('div', { class: 'loading' }));

  misskey.api.POST<MisskeyNote>('notes/show', { noteId }).then(
    note => {
      document.body.prepend(
        h('div', { class: 'head' },
          h('m3-button', { type: 'text', onclick() { history.back() } }, h('icon', { name: 'arrow_back' })),
        )
      )
      root.replaceChild(h('mi-note', { note }), <Node>root.qS('.loading'))
    }
  );

  return [
    root
  ];
}