import { h } from "@/scripts";

export const app = {
  host: location.hash,

  toast: {
    add({ type, contents }: { type?: string, contents: (InheritsFromNode | string)[] | (InheritsFromNode | string) }) {
      const root = document.qS('#notification') ?? document.body.appendChild(h('div', { id: 'notification' }));

      if (contents) {
        const $ = root.appendChild(h('div', {
          class: `toast-notification ${type ?? ''}`,
        },
          h('icon', { name: type == 'error' ? 'error' : 'info' }),
          ...(Array.isArray(contents) ? contents : [contents]),
          h('m3-button', { type: 'text', onclick() { $.remove() } }, 'OK')
        ));
        setTimeout(() => ($.remove()), 2000);
      }
    }
  }
}