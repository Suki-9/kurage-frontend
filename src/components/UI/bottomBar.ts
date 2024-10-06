import './styles/bottomBar.css'
import { h } from '@/scripts'


export function bottomBar(): BottomBarElement {
  let modal: nullable<HTMLDivElement> = null;

  return <BottomBarElement>h('div', { id: 'bottom-bar' },
    h('m3-button', { onclick() { location.href = '/' } }, h('icon', { name: 'home' })),
    h('m3-button', {}, h('icon', { name: 'mail' })),
    h('m3-button', {}, h('icon', { name: 'notifications' })),
    h('m3-button', {
      onclick() {
        if (modal && document.body.contains(modal)) modal.remove();
        else modal = document.body.appendChild(h('post-modal'))
      }
    }, h('icon', { name: 'edit' }))
  );
}