import './styles/home.css'
import { h } from "@/scripts"

export function Page(): InheritsFromNode[] {
  document.qS(':root')?.removeAttribute('page');
  return [
    h('timeline'),
    h('bottom-bar'),
  ]
};
