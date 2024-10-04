import './styles/bottomBar.css'
import { h } from '@/scripts'

export function bottomBar(): HTMLDivElement {
  let modal = null;
  const root = h('div', { id: 'bottom-bar' },
    h('m3-button', {}, h('icon', { name: 'menu' }, )),
    h('m3-button', { onclick() { location.href = '/' } }, h('icon', { name: 'home' })),
    h('m3-button', {}, h('icon', { name: 'mail' })),
    h('m3-button', {}, h('icon', { name: 'notifications' })),
    h('m3-button', {
      onclick() {
        // TODO 上手い事型を付ける必要あり

        // if (document.body.contains(this.modal)) this.modal.remove();
        // else this.modal = document.body.appendChild(h('mi-post-modal'))
      }
    }, h('icon', { name: 'edit' }))
  );
  return root;
}