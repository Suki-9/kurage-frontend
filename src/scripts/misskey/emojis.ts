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
  index: nullable<MiEmoji[]>;
  category: nullable<CategorizedIndex>;

  init: (instance: string) => Promise<void>;
  search: (t: 'aliases' | 'category' | string, q: string) => any;
}

export const emojis: MisskeyEmojisUtils = {
  get Initialized() {
    return Boolean(emojis.index && emojis.category);
  },
  index: null,
  category: null,
  init: async (instance: string) => new Promise<void>(async (resolve, reject) => {
    emojis.index = (await IDB.get(`${instance}::emojis`)) ?? await fetch(instance + '/api/emojis').then(async r => {
      const { emojis }: { emojis: MiEmoji[] } = (await r.json());
      await IDB.put({ key: `${instance}::emojis`, val: emojis });
      return emojis;
    });
    emojis.category = await IDB.get(`${instance}::emojis::category-index`) ?? ($ => (IDB.put({ key: `${instance}::emojis::category-index`, val: $ }), $))(emojis.index?.reduce<CategorizedIndex>((r, e) => ($ => ($['$'] ? $['$'].push(e) : $['$'] = [e], r))(e.category.split('/').filter(v => v).map(v => v.trim()).reduce((a, c) => c in a ? a[c] : (a[c] = {}, a[c]), r)), {}));

    resolve();
  }),
  search(t: 'aliases' | 'category' | string, q: string) {
    if (emojis.Initialized) {
      if (t == 'aliases') return emojis.index!.filter(e => e.aliases.includes(q));
      if (t == 'category') return emojis.index!.filter(e => e.category == q);
      else for (const e of emojis.index!) if (e.name == (q.match(/:.+@\.:/) ? q.match(/(?<=\:).*(?=@\.\:)/g)![0] : q)) return e;
    }
    else throw new Error('Please initialize')
  }
}