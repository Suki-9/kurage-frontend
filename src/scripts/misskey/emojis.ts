import { IDB } from "@/scripts";

type MiEmoji = {
  aliases: string;
  category: string;
  name: string;
  url: string;
}

type CategorizedIndex = { [K: string]: CategorizedIndex } & { $?: MiEmoji[] };

type MisskeyEmojisUtils = {
  Initialized: boolean;
  _index: nullable<Record<string, { $: MiEmoji[], category?: nullable<CategorizedIndex> }>>;

  init: () => Promise<void>;
  add: (instance: string) => Promise<void>;
  search: (t: 'aliases' | 'category' | string, q: string, instance: string) => any;
}

// TODO コードを短くする (基本機能完成後)
export const emojis: MisskeyEmojisUtils = {
  get Initialized() {
    return Boolean(emojis._index);
  },
  _index: null,

  async init() {
    if (!this._index) this._index = {};
    for (const { key, val } of (await IDB.get<{ key: string, val: any }[]>('emojis', '*'))) {

      this._index[key] = { $: val };

      Object.defineProperty(this._index[key], '_category', { value: null, writable: true, configurable: true });
      Object.defineProperty(this._index[key], 'category', {
        get(): CategorizedIndex {
          return this._category ?? (
            this._category = (<MiEmoji[]>this.$).reduce<CategorizedIndex>((r, e) => ($ => ($['$'] ? $['$'].push(e) : $['$'] = [e], r))(e.category.split('/').filter(v => v).map(v => v.trim()).reduce((a, c) => c in a ? a[c] : (a[c] = {}, a[c]), r)), {})
          );
        }
      })
    }
  },

  // TODO 改善の余地あり？
  async add(instance: string) {
    return fetch(instance + '/api/emojis').then(
      async r => {
        const { emojis }: { emojis: MiEmoji[] } = (await r.json());
        await IDB.put('emojis', { key: instance, val: emojis });

        if (!this._index) this._index = {};

        this._index[instance] = { $: emojis };

        Object.defineProperty(this._index[instance], '_category', { value: null, writable: true, configurable: true });
        Object.defineProperty(this._index[instance], 'category', {
          get(): CategorizedIndex {
            return this._category ?? (
              this._category = (<MiEmoji[]>this.$).reduce<CategorizedIndex>((r, e) => ($ => ($['$'] ? $['$'].push(e) : $['$'] = [e], r))(e.category.split('/').filter(v => v).map(v => v.trim()).reduce((a, c) => c in a ? a[c] : (a[c] = {}, a[c]), r)), {})
            );
          }
        })
      }
    )
  },

  search(t: 'aliases' | 'category' | 'name' | string, q: string, instance: string) {
    if (this._index) {
      if (t == 'aliases') return this._index[instance].$?.filter(e => e.aliases.includes(q));
      if (t == 'category') return this._index[instance].$?.filter(e => e.category == q);
      else for (const e of this._index[instance].$) if (e.name == (q.match(/:.+@\.:/) ? q.match(/(?<=\:).*(?=@\.\:)/g)![0] : q)) return e;
    }
    else throw new Error('Please initialize');
  }
}
