import './styles/m3-button.css'
import { h } from '@/scripts'

export function m3Button(o: KuElementTagNameMap['m3-button']['options'] | null, ...c: (InheritsFromNode | string | falsy)[]) {
  const attr = o === null || o instanceof Node || typeof o === 'string' ? {} : o;

  const root = h('button', { ...attr, class: `m3-button ${attr.class ?? ''}`, type: attr.type ?? 'outlined' },
    o instanceof Element && o, ...c
  );

  root.on('click', e => {
    if (!root.disabled) {
      const eff = root.appendChild(h('span', { class: 'ripple', 'style': `top: ${e.offsetY - 75}px; left: ${e.offsetX - 75}px;` }));
      setTimeout(() => root.contains(eff) && eff.remove(), 800)
    }
  });

  return root;
}