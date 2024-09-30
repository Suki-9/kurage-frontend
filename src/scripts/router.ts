
const mi: {
  users: { i?: string }[]
} = { users: [] };

export const router = {
  push(path: string): void {
    import(path).then(m => {
      document.body.removeChildren();
      document.body.append(...m.Page());
    });
  },
  routing() {
    const p = location.pathname;
    if ((mi.users[0] ?? {}).i) {

    } else
      if (p === '/callback') router.push('../pages/callback')
      else router.push('../pages/login')
  }
}