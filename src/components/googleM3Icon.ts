import { h } from "@/scripts";

export function googleM3Icon(o: KuElementTagNameMap['icon']['options']) {
    return h('span', { ...o, class: `material-symbols-outlined ${o.class ?? ''}` }, o.name);
}
