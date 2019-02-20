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
export interface BadgeOption extends TextOption {
  label?: TextSeed
  pill?: boolean
  modifier?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark"
}
export class Badge extends Text {
  constructor(parent: DOM, text: MayStore<string>, option: BadgeOption = {}) {
    super(parent, text, option)
    this.$dom.classList.add("badge")
    if (option.modifier) this.$dom.classList.add(`badge-${option.modifier}`)
    if (option.pill) this.$dom.classList.add("badge-pill")
    if (option.label) {
      let label = Text.bloom(this, option.label)
      label.$dom.classList.add("badge-light")
      label.$dom.classList.add("badge")
    }
  }
}

export type TextSequenceElem = [MayStore<string>, TextOption | string] | TextSeed;
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
      else if (typeof elem === "string" || elem instanceof Store) new Text(this, elem, this.currentOption)
      else {
        let [text, option] = elem;
        if (typeof option === "string")
          this.currentOption.color = Color.parse(option)
        else this.currentOption = { ...this.currentOption, ...option };
        new Text(this, text, this.currentOption);
      }
    }
  }
}

