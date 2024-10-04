import { misskey } from "@/scripts";

export const router = {
  push(path: string): void {
    import(path).then(m => {
      document.body.removeChildren();
      document.body.append(...m.Page());
      if ('onMounted' in m) m.onMounted();
    });
  },
  routing(p: string = location.pathname) {

    if (misskey.users.loginUser)
      if (p === '/') router.push('../pages/home')
      else if (p === '/login') router.push('../pages/login')
      else if (p === '/callback') router.push('../pages/callback')
      else router.push('../pages/notfound')
    else
      if (p === '/callback') router.push('../pages/callback')
      else router.push('../pages/login')
  }
}