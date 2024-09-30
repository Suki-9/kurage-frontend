type KuAudioPlayer = {} & HTMLDivElement;
type MisskeyNote = any;

type InheritsFromNode = HTMLElement | Element | Node | Text;
type KuElementAttributes<T = {}> = Record<string, any> & { onclick?: () => any } & T;
type KuElementTagNameMap = {
  'text': {
    options: string;
    type: Text;
  };
  'icon': {
    options: KuElementAttributes<{ name: string; }>;
    type: HTMLSpanElement;
  };
  'm3-button': {
    options: InheritsFromNode | string | KuElementAttributes;
    type: HTMLButtonElement
  };
  'm3-modal': {
    options: InheritsFromNode | string | KuElementAttributes;
    type: HTMLDivElement;
  };
  'm3-bottom-sheet': {
    options: InheritsFromNode | string | KuElementAttributes;
    type: HTMLDivElement;
  };
  'audio-player': {
    options: KuElementAttributes<{ src: string, isOwner?: boolean }>
    type: KuAudioPlayer;
  };
  'mi-note': {
    options: KuElementAttributes<{ note: string | MisskeyNote }>;
    type: HTMLDivElement;
  };
  'mi-post-modal': {
    options: KuElementAttributes<{ quote?: MisskeyNote, reply?: MisskeyNote }>;
    type: HTMLDivElement;
  };
  'timeline': {
    options?: nullish;
    type: HTMLDivElement;
  };
  'mi-emoji-pallet': {
    options: KuElementAttributes<{
      emitter: (e: string) => unknown;
    }>;
    type: HTMLDivElement;
  };
  'mi-bottom-bar': {
    options: KuElementAttributes;
    type: HTMLDivElement;
  };
};
