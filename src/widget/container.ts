import { Box, BoxOption, DOM, TextAlignType, DOMOption } from "../dom";
import { TextSeed, Text } from "./text";
export interface FlexBoxOption extends BoxOption {
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline"
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  alignContent?: "stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  // 子要素には order / flex-grow / flex-shrink / flex-basis / align-self があるが
}
export class FlexBox extends Box {
  constructor(parent: Box, option: FlexBoxOption) {
    super(parent, option)
    this.applyStyle({ display: "flex" })
  }
}
export interface TableOption extends BoxOption {
  widthes?: number[]
  caption?: TextSeed
  captionSide?: "top" | "bottom" | "left" | "right"
  borderSpacing?: number
  borderCollapse?: "collapse" | "separate"
}
type DOMOptionFunc = ((x: number, y: number) => DOMOption)
export class Table extends Box {
  private ySize: number = 0;
  private domOptionFunc: DOMOptionFunc
  constructor(parent: Box, option: TableOption = {}, domOptionFunc: DOMOptionFunc = (x, y) => ({})) {
    super(parent, { ...option, tag: "table" })
    this.domOptionFunc = domOptionFunc;
    if (option.caption) Text.bloom(this, option.caption)
  }
  addHeader(header: TextSeed[]): Table {
    if (header.length === 0) return this;
    let tr = new DOM(this, "tr")
    for (let x = 0; x < header.length; x++)
      Text.bloom(new DOM(tr, { ...this.domOptionFunc(x, 0), tag: "th" }), header[x])
    return this;
  }
  addContents(contents: TextSeed[][]): Table {
    if (contents.length === 0) return this;
    for (let tds of contents) {
      this.ySize++;
      let tr = new DOM(this, "tr")
      for (let x = 0; x < tds.length; x++)
        Text.bloom(new DOM(tr, { ...this.domOptionFunc(x, this.ySize), tag: "th" }), tds[x])
    }
    return this
  }
}