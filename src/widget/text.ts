import { Color } from "../color";
import { Box } from "../dom";

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
    this.$text = val;
    this.$dom.innerText = val;
  }
}
