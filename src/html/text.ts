import { Color } from "../core/color";
import { DOM, DOMOption } from "../core/dom";
import { MayStore, assign, HasValueWidgetInterface, Store } from "../core/store";
export interface TextOption extends DOMOption {
  color?: Color | string
  isBold?: boolean
  href?: MayStore<string>,
  tag?: "span" | "code" | "pre" | "marquee" | "div"
  edge?: { color: Color, width: number }
}
export type TextSeed = MayStore<string> | ((p: DOM) => DOM) // そのtextで作成するか関数適応
export class Text extends DOM implements HasValueWidgetInterface<string> {
  private $text: string;
  get value(): string { return this.$text; }
  set value(val: string) {
    this.$text = val.replace(" ", '\u00a0');
    this.$dom.innerText = this.$text;
  }
  constructor(parent: DOM, text: MayStore<string>, option: TextOption = {}) {
    super(parent, { ...option, tag: option.href ? "a" : "span" })
    assign(text, t => this.value = t)
    if (option.href) assign(option.href, t => this.$dom.setAttribute("href", t))
    this.applyStyle({
      color: typeof option.color === "string" ? Color.parse(option.color) : option.color,
      font: { weight: option.isBold && "bold" },
      ...(!option.edge ? {} : { "-webkit-text-stroke": option.edge })
    })
  }
  static bloom(parent: DOM, seed: TextSeed): DOM {
    if (typeof seed === "string") return new Text(parent, seed)
    if (seed instanceof Store) return new Text(parent, seed)
    return seed(parent)
  }
}
export function textAssign(parent: DOM, may: TextSeed, func: ((t: string) => any)) {
  if (typeof may === "function") may(parent)
  else assign(may, func)
}
interface SpinnerOption extends DOMOption {
  type?: "border" | "grow"
}
export class Spinner extends DOM {
  constructor(parent: DOM, option: SpinnerOption = {}) {
    super(parent, option)
    this.$dom.classList.add(`spinner-${option.type === "grow" ? "grow" : "border"}`)
  }
}
export class HR extends DOM {
  constructor(parent: DOM) {
    super(parent, { tag: "hr" })
  }
}
