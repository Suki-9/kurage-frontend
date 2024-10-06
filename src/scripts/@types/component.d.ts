type KuAudioPlayer = {} & HTMLDivElement;

type MisskeyReaction = {
  userId: string;
  reaction: string;
}

interface BottomBarElement extends HTMLDivElement {
  modal: HTMLDivElement;
}

interface MisskeyNoteElement extends HTMLDivElement {
  $n: MisskeyNote;

  quote: HTMLElement;
  renoter: HTMLElement;

  removeReaction: (e: MisskeyReaction) => void;
  addReaction: (e: MisskeyReaction) => void;

  reaction: (e: string) => Promise<void>;

  renote: () => void;
  removeNote: () => void;
}

type InheritsFromNode = HTMLElement | Element | Node | Text;
type KuElementAttributes<T = {}> = Record<string, any> & {
  onclick?: (this: GlobalEventHandlers, { target }: MouseEvent) => any;
} & T;
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
    type: MisskeyNoteElement;
  };
  'post-modal': {
    options: KuElementAttributes<{ quote?: MisskeyNote, reply?: MisskeyNote }>;
    type: HTMLDivElement;
  };
  'timeline': {
    options?: {
      instance?: string;
      channel: 'timeline' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline';
    };
    type: HTMLDivElement;
  };
  'mi-emoji-pallet': {
    options: KuElementAttributes<{
      emitter?: (e: { name: string }) => unknown;
    }>;
    type: HTMLDivElement;
  };
  'bottom-bar': {
    options: KuElementAttributes;
    type: BottomBarElement;
  };
};
