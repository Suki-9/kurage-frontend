Document.prototype.qS = Document.prototype.querySelector;
Element.prototype.qS = Element.prototype.querySelector;
Element.prototype.qSAll = Element.prototype.querySelectorAll;
Element.prototype.removeChildren = function () {
  this.parentNode?.replaceChild(this.cloneNode(false), this);
};

Node.prototype.remove = function () {
  this.parentNode?.removeChild(this);
}

EventTarget.prototype.on = function on<K extends keyof HTMLElementEventMap>(
  type: keyof HTMLElementEventMap | string,
  listener: typeof type extends keyof HTMLElementEventMap ? (this: HTMLButtonElement, ev: HTMLElementEventMap[K]) => any : EventListenerOrEventListenerObject | null,
  options: boolean | AddEventListenerOptions
) {
  this.addEventListener(type, listener, options);
  return this;
};
NodeList.prototype.shift = function () { this.length && this[0].parentNode?.removeChild(this[this.length - 1]) }
NodeList.prototype.toArray = function () { return [...this] }