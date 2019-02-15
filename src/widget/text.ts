import { Color } from "../color";
import { Box } from "../dom";
import { library, icon } from '@fortawesome/fontawesome-svg-core'
import * as FA from '@fortawesome/free-solid-svg-icons'
import { pushd } from "shelljs";
export interface TextOption {
  size?: number
  fontName?: string
  color?: Color
  isBold?: boolean
  edge?: { color: Color, width: number }
}
export class Text extends Box {
  constructor(parent: Box, text: string, option?: TextOption) {
    super(parent, { tag: "span" })
    this.text = text;
    if (!option) return;
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
type TextSequenceElem = [string, TextOption | string] | ((parent: Box) => Box);
export class TextSequence extends Box {
  private children: Box[] = [];
  private currentOption: TextOption;
  constructor(parent: Box, texts: TextSequenceElem[]) {
    super(parent, { tag: "span" });
    this.currentOption = {};
    this.add(texts)
  }
  add(texts: TextSequenceElem[]) {
    for (let elem of texts) {
      if (typeof elem === "function") {
        this.children.push(elem(this));
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
export class FAIcon extends Box {
  constructor(parent: Box, name: string, option?: FAIconOption) {
    super(parent, { tag: "span" })
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