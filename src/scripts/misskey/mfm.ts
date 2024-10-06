import { parse, MfmNode } from 'mfm-js';
import { h, misskey } from '@/scripts';

export function mfm(t: nullable<string>): (InheritsFromNode | string | falsy)[] {
  const N2D = (node: MfmNode): (InheritsFromNode | string | falsy) => {
    if (node.type === 'text') return h('span', node.props.text);
    else if (node.type === 'url') return h('a', { href: node.props.url }, ...(node.children ? node.children.map(N2D) : [node.props.url]));
    else if (node.type === 'hashtag') return h('a', { class: 'hashtag' }, node.props.hashtag);
    else if (node.type === 'emojiCode') {
      const emoji = misskey.emojis.search('name', node.props.name);
      return emoji ? h('img', { src: emoji.url, class: 'emoji', loading: 'lazy' }) : h('span', node.props.name);
    }
  };

  return parse(t ?? '').map(N2D);
};