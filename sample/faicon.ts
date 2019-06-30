import { library, icon } from '@fortawesome/fontawesome-svg-core'
import * as FA from '@fortawesome/free-solid-svg-icons';
import * as I from "../";
export interface FAIconOption extends I.DOMOption {
  size?: number,
  color?: I.Color | I.ColorScheme
}
export class FAIcon extends I.DOM {
  constructor(parent: I.DOM, name: string, option?: FAIconOption) {
    super(parent, "span")
    let fa = FA[name] // ex:faIgloo
    library.add(fa)
    this.$dom.appendChild(icon(fa).node[0]);
    if (!option) return;
    this.applyStyle({
      color: option.color,
      font: { size: option.size }
    });
  }
}
