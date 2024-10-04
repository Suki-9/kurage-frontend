import { h } from "@/scripts"

export function Page(): InheritsFromNode[] {
  return [
    h('h1', { style: 'text-align: center;' }, '404 Not Found...'),
  ]
};