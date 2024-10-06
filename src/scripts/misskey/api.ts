import { misskey } from "@/scripts";

export const api = {
  async POST<R>(
    ep: string,
    b: FormData | Record<string, any>,
    op: {
      instance?: string;
      i?: string;
    } = {}
  ): Promise<R> {
    const
      i = op.i ?? misskey.users.loginUser?.i,
      [headers, body] = b instanceof FormData
        ? [{}, (i && b.set('i', i), b)]
        : [{ "Content-Type": "application/json" }, (b.i = i, JSON.stringify(b))];

    return fetch(
      [op.instance ?? misskey.users.loginUser?.host, 'api', ep].join('/'),
      { method: 'POST', headers, body }
    ).then(async r => {
      const t = await r.text();
      try { return JSON.parse(t) } catch { return t };
    });
  }
}