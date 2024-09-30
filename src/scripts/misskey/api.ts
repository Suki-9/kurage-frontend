import { cookie } from "@/scripts";

export const api = {
  POST(
    ep: string,
    b: FormData | Record<string, any>,
    op: {
      instance?: string;
      i?: string;
    } = {}
  ) {
    const
      i = op.i ?? cookie.read('i'),
      [headers, body] = b instanceof FormData
        ? [{}, (i && b.set('i', i), b)]
        : [{ "Content-Type": "application/json" }, (b.i = i, JSON.stringify(b))];

    return fetch(
      [op.instance ?? cookie.read('instance'), 'api', ep].join('/'),
      { method: 'POST', headers, body }
    ).then(async r => {
      const t = await r.text();
      try { return JSON.parse(t) } catch { return t };
    });
  }
}