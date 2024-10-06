import { IDB } from "@/scripts";

type MisskeyEmojisUtils = {
  Initialized: boolean;
  _index: nullable<Record<string, { $: MisskeyEmoji[], category?: nullable<CategorizedIndex> }>>;

  init: () => Promise<void>;
  add: (instance: string) => Promise<void>;
  get: <T extends 'categorized' | 'list'>(instance: string, type?: T) => nullable<T extends 'categorized' ? CategorizedIndex : MisskeyEmoji[]>;
  search: <T extends 'aliases' | 'category' | string>(t: T, q: string, instance: string, limit?: number) => T extends 'aliases' ? MisskeyEmoji[] : T extends 'category' ? MisskeyEmoji[] : nullable<MisskeyEmoji>;
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
            this._category = (<MisskeyEmoji[]>this.$).reduce<CategorizedIndex>((r, e) => ($ => ($['$'] ? $['$'].push(e) : $['$'] = [e], r))(e.category.split('/').filter(v => v).map(v => v.trim()).reduce((a, c) => c in a ? a[c] : (a[c] = {}, a[c]), r)), {})
          );
        }
      })
    }
  },

  // TODO 改善の余地あり？
  async add(instance: string) {
    return fetch(instance + '/api/emojis').then(
      async r => {
        const { emojis }: { emojis: MisskeyEmoji[] } = (await r.json());
        await IDB.put('emojis', { key: instance, val: emojis });

        if (!this._index) this._index = {};

        this._index[instance] = { $: emojis };

        Object.defineProperty(this._index[instance], '_category', { value: null, writable: true, configurable: true });
        Object.defineProperty(this._index[instance], 'category', {
          get(): CategorizedIndex {
            return this._category ?? (
              this._category = (<MisskeyEmoji[]>this.$).reduce<CategorizedIndex>((r, e) => ($ => ($['$'] ? $['$'].push(e) : $['$'] = [e], r))(e.category.split('/').filter(v => v).map(v => v.trim()).reduce((a, c) => c in a ? a[c] : (a[c] = {}, a[c]), r)), {})
            );
          }
        })
      }
    )
  },

  // @ts-ignore
  // アホTSのせいでウマいこと推論しない。
  get(instance, type) {
    if (this._index) {
      if (type === 'categorized') return this._index[instance]['category'] as unknown as MisskeyEmoji[];
      else return this._index[instance].$ as unknown as MisskeyEmoji[];
    }
    else throw new Error('Please initialize');
  },

  // @ts-ignore
  search(t: 'aliases' | 'category' | 'name' | string, q: string, instance: string, limit: number = 50) {
    if (this._index) {
      if (t == 'aliases') {
        const result: MisskeyEmoji[] = [];

        for (const e of this._index[instance].$) {
          for (const alias of [...e.aliases, e.name]) if (~alias.indexOf(q)) {
            result.push(e);
            break;
          }
          if (limit <= result.length) break;
        }

        return result;
      }
      if (t == 'category') return this._index[instance].$?.filter(e => e.category == q);
      else for (const e of this._index[instance].$) if (e.name == (q.match(/:.+@\.:/) ? q.match(/(?<=\:).*(?=@\.\:)/g)![0] : q)) return e;
    }
    else throw new Error('Please initialize');
  }
}
