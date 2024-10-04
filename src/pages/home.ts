import './styles/home.css'
import { h } from "@/scripts"

export function Page(): InheritsFromNode[] {
  return [
    h('timeline'),
    h('bottom-bar'),
  ]
};
