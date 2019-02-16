import { Color } from "../color";
import { DOM } from "../dom";
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import * as FA from '@fortawesome/free-solid-svg-icons'
export interface TextOption {
  size?: number
  fontName?: string
  color?: Color
  isBold?: boolean
  tag?: "span" | "code" | "pre" | "marquee"
  edge?: { color: Color, width: number }
}
export class Text extends DOM {
  constructor(parent: DOM, text: string, option: TextOption = {}) {
    super(parent, option.tag || "span")
    this.text = text;
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
  private $text: string;
  get text(): string { return this.$text; }
  set text(val: string) {
    this.$text = val.replace(" ", '\u00a0');
    this.$dom.innerText = this.$text;
  }
}
type TextSequenceElem = string | [string, TextOption | string] | ((parent: DOM) => DOM);
export class TextSequence extends DOM {
  private children: DOM[] = [];
  private currentOption: TextOption;
  constructor(parent: DOM, texts: TextSequenceElem[]) {
    super(parent, "span");
    this.currentOption = {};
    this.add(texts)
  }
  add(texts: TextSequenceElem[]) {
    for (let elem of texts) {
      if (typeof elem === "function") {
        this.children.push(elem(this));
      } else if (typeof elem === "string") {
        this.children.push(new Text(this, elem, this.currentOption))
      } else {
        let [text, option] = elem;
        if (typeof option === "string")
          this.currentOption.color = Color.parse(option)
        else this.currentOption = { ...this.currentOption, ...option };
        let textElem = new Text(this, text, this.currentOption);
        this.children.push(textElem);
      }
    }
  }
  clear() {
    for (let child of this.children) child.destroy();
  }
}

export interface FAIconOption {
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