interface Document {
  qS: typeof Document.prototype.querySelector;
}

interface Element {
  qS: typeof Element.prototype.querySelector;
  qSAll: typeof Element.prototype.querySelectorAll;
  removeChildren: () => void;
}

interface Node {
  remove: () => void;
}

interface EventTarget {
  on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): this;
  on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): this;
}

interface NodeList {
  shift: () => void;
  toArray: () => Node[]
}