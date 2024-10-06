import '@/style.css'
import './prototypeExtensions'
import { router, misskey } from '@/scripts'

Promise.all([
  misskey.emojis.init(),
  misskey.users.init()
]).then(
  () => {
    router.routing();
  }
);