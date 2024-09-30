import './styles/login.css'
import { h, cookie, genId } from "@/scripts"

export function Page(): InheritsFromNode[] {
  const input = h('input', { type: 'text', placeholder: 'e.g. https://hoge.tld' });
  const button = h('m3-button', {
    onclick() {
      window.location.href = (cookie.write('instance', input.value), `${input.value}/miauth/${genId()}?name=FastKey&callback=${location.origin}/callback&permission=read:account,write:account,read:blocks,write:blocks,read:drive,write:drive,read:favorites,write:favorites,read:following,write:following,read:messaging,write:messaging,read:mutes,write:mutes,write:notes,read:notifications,write:notifications,write:reactions,write:votes,read:pages,write:pages,write:page-likes,read:page-likes,write:gallery-likes,read:gallery-likes`)
  }, type: 'outlined' }, 'Login');

  button.disabled = true;
  input.on('input', () => {
    button.disabled = !Boolean(input.value && input.value.match(/https?:\/\/(.+)(\..+)+/));
  });

  return [
    h('h1', 'Kurage'),
    h('h2', 'login'),
    h('p', 'MiAuthを用いてログインします。'),
    input,
    button,
  ]
};