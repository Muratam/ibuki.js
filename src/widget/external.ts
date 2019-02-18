import { library, icon } from '@fortawesome/fontawesome-svg-core'
import * as FA from '@fortawesome/free-solid-svg-icons'
import { Color, ColorScheme } from "../core/color";
import { DOM, DOMOption } from "../core/dom";
export interface FAIconOption extends DOMOption {
  size?: number,
  color?: Color | ColorScheme
}
export class FAIcon extends DOM {
  constructor(parent: DOM, name: string, option?: FAIconOption) {
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