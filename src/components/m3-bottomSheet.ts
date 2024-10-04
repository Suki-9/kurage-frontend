import './styles/m3-bottomSheet.css';
import { h } from "@/scripts";

export function m3BottomSheet(o: KuElementTagNameMap['m3-bottom-sheet']['options'], ...c: (InheritsFromNode | string | falsy)[]) {
  const attr = o instanceof Node || typeof o === 'string' ? {} : o;

  const sheet = h('div', {
    ...attr, class: `bottom-sheet ${attr.bg ? 'bg' : 'ignore'}`, onclick({ target }) {
      if (target == sheet) sheet.remove();
    }
  });
  const slot = h('div', { class: ['slot', attr.class].join(' ') }, o instanceof Element && o, ...c)
  const root = h('div', { class: 'root' },
    h('span', { class: 'tip' }),
    slot
  );

  let lastPosition: nullable<number> = null;
  let rootHeight: nullable<number> = null;
  let move: nullable<number> = null;

  // TODO あまりにも強引過ぎる。
  slot.on('touchmove', e => (slot.clientHeight !== slot.scrollHeight || (<HTMLElement>e.target).tagName === 'INPUT') && e.stopPropagation())

  root
    .on('touchstart', e => (lastPosition = e.changedTouches[0].pageY, rootHeight = root.offsetHeight))
    .on('touchmove', e => {
      e.stopPropagation();
      e.preventDefault();
      if (0 < (move = e.changedTouches[0].pageY - lastPosition!) && move < rootHeight!) root.style.height = (rootHeight! - move) + 'px';
    })
    .on('touchend', _ => {
      move! / rootHeight! > 0.7 && sheet.remove();
      root.style.height = '';
    });

  sheet.append(root);

  return sheet;
}