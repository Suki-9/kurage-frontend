import { misskey } from "@/scripts"
import * as Pages from "@/pages"

type Page = InheritsFromNode[];

export const router = {
  push(p: Page): void {
    document.body.removeChildren();
    document.body.append(...p);
  },
  routing(p: string = location.pathname) {

    if (misskey.users.loginUser)
      if (p === '/') router.push(Pages.Home())
      else if (p === '/login') router.push(Pages.Login())
      else if (p === '/callback') router.push(Pages.Callback())
      else router.push(Pages.Notfound())
    else
      if (p === '/callback') router.push(Pages.Callback())
      else router.push(Pages.Login())
  }
}