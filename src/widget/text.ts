import { Color } from "../color";
import { DOM, DOMOption } from "../dom";
import { MayRoot, assign } from "../root"
import { HasValueWidgetInterface, Root } from "../root";
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import * as FA from '@fortawesome/free-solid-svg-icons'
export interface TextOption extends DOMOption {
  size?: number
  fontName?: string
  color?: Color
  isBold?: boolean
  tag?: "span" | "code" | "pre" | "marquee" | "div"
  edge?: { color: Color, width: number }
}
export type TextSeed = MayRoot<string> | ((p: DOM) => DOM) // そのtextで作成するか関数適応
export class Text extends DOM implements HasValueWidgetInterface<string> {
  private $text: string;
  get value(): string { return this.$text; }
  set value(val: string) {
    if (this.destroyed) return;
    this.$text = val.replace(" ", '\u00a0');
    this.$dom.innerText = this.$text;
  }
  constructor(parent: DOM, text: MayRoot<string>, option: TextOption = {}) {
    super(parent, option.tag || "span")
    assign(text, t => this.value = t)
    this.applyStyle({
      color: option.color,
      font: {
        size: option.size,
        family: option.fontName,
        weight: option.isBold && "bold"
      },
      ...(!option.edge ? {} : { "-webkit-text-stroke": option.edge })
    })
  }
  static bloom(parent: DOM, seed: TextSeed): DOM {
    if (typeof seed === "string") return new Text(parent, seed)
    if (seed instanceof Root) return new Text(parent, seed)
    return seed(parent)
  }
}
export class FixedSizeText extends Text {
  constructor(parent: DOM, text: MayRoot<string>, width: number, height: number, textOption: TextOption = {}) {
    super(parent, text, { tag: "div", ...textOption })
    this.applyStyle({ width: width, height: height, display: "inline-block" })
  }
}
type TextSequenceElem = [string, TextOption | string] | TextSeed;
export class TextSequence extends DOM {
  private currentOption: TextOption;
  constructor(parent: DOM, texts: TextSequenceElem[]) {
    super(parent, "span");
    this.currentOption = {};
    this.add(texts)
  }
  add(texts: TextSequenceElem[]) {
    for (let elem of texts) {
      if (typeof elem === "function") elem(this)
      else if (typeof elem === "string" || elem instanceof Root) new Text(this, elem, this.currentOption)
      else {
        let [text, option] = elem;
        if (typeof option === "string")
          this.currentOption.color = Color.parse(option)
        else this.currentOption = { ...this.currentOption, ...option };
        new Text(this, text, this.currentOption);
      }
    }
  }
  clear() { for (let child of this.children) child.destroy(); }
}

export interface FAIconOption extends DOMOption {
  size?: number,
  color?: Color
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