import './styles/m3-modal.css'
import { h } from "@/scripts"

export function m3Modal(o: KuElementTagNameMap['m3-modal']['options'], ...c: (InheritsFromNode | string | falsy)[]) {
  const
    attr = o instanceof Node || typeof o === 'string' ? (c.unshift(o), { actions: {} }) : o,
    modal = h('div', { class: 'root' },
      h('icon', { name: attr.type ?? 'info', class: 'icon' }),
      h('div', {}, ...c)
    ),
    root = h('div', {
      class: 'm3-modal', onclick() {
        if ('Cancel' in attr.actions) attr.actions.Cancel();
        root.remove();
      }
    }, modal);

  modal.append(
    h('div', { class: 'buttons' },
      h('m3-button', {
        onclick() {
          if ('OK' in attr.actions) attr.actions.OK();
          root.remove()
        }
      }, 'OK'),
      h('m3-button', {
        onclick() {
          if ('Cancel' in attr.actions) attr.actions.Cancel();
          root.remove();
        }
      }, 'Cancel')
    )
  );

  return root;
}