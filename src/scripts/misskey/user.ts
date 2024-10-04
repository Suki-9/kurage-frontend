import { IDB, store } from "@/scripts";

type MisskeyUsersUtils = {
  Initialized: boolean;
  loginUser: nullable<MisskeyUser>;

  _index: nullable<Record<string, Record<string, MisskeyUser>>>;

  init: () => Promise<void>;
  add: (instance: string, user: MisskeyUser) => Promise<void>;
  get: (instance: string, userId: string) => nullable<MisskeyUser>;
}
export const users: MisskeyUsersUtils = {

  get Initialized() {
    return Boolean(users._index);
  },

  loginUser: null,
  _index: null,

  async init() {
    if (!this._index) this._index = {};

    for (const { key, val } of (await IDB.get<{ key: string, val: MisskeyUser }[]>('users', '*'))) {
      const [origin, userId] = key.split('::');

      if (!this._index[origin]) this._index[origin] = {};

      this._index[origin][userId] = val;
    };

    const loginUser = store.get('loginUser');

    if (loginUser) {
      const [origin, userid] = loginUser.split('::');
      this.loginUser = this.get(origin, userid);
    };
  },

  async add(instance: string, user: MisskeyUser): Promise<void> {
    await IDB.put('users', { key: `${instance}::${user.id}`, val: user });
    if (this._index) {
      if (!this._index[instance]) this._index[instance] = {};
      this._index[instance][user.id] = user;
    } else await users.init();
  },

  get(instance: string, userId: string): nullable<MisskeyUser> {
    if (this._index) return instance in this._index ? this._index[instance][userId] : null;
    else throw new Error('Please initialize');
  }
}