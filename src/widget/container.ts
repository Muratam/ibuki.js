import { Container, ContainerOption, DOM, TextAlignType, DOMOption } from "../dom";
import { TextSeed, Text } from "./text";
export interface FlexBoxOption extends ContainerOption {
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline"
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  alignContent?: "stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  // 子要素には order / flex-grow / flex-shrink / flex-basis / align-self があるが
}
export class FlexBox extends Container {
  constructor(parent: Container, option: FlexBoxOption) {
    super(parent, option)
    this.applyStyle({ display: "flex" })
  }
}
export interface TableOption extends ContainerOption {
  widthes?: number[]
  caption?: TextSeed
  captionSide?: "top" | "bottom" | "left" | "right"
  borderSpacing?: number
  borderCollapse?: "collapse" | "separate"
}
type ContainerOptionFunc = ((x: number, y: number) => ContainerOption)
export class Table extends Container {
  private ySize: number = 0;
  private containerOptionFunc: ContainerOptionFunc
  constructor(parent: Container, option: TableOption = {}, containerOptionFunc: ContainerOptionFunc = (x, y) => ({})) {
    super(new Container(parent, option), { ...option, tag: "table" })
    this.containerOptionFunc = containerOptionFunc;
    if (option.caption) Text.bloom(this, option.caption)
  }
  addHeader(header: TextSeed[]): Table {
    if (header.length === 0) return this;
    let tr = new DOM(this, "tr")
    for (let x = 0; x < header.length; x++)
      Text.bloom(new DOM(tr, { ...this.containerOptionFunc(x, 0), tag: "th" }), header[x])
    return this;
  }
  addContents(contents: TextSeed[][]): Table {
    if (contents.length === 0) return this;
    for (let tds of contents) {
      this.ySize++;
      let tr = new DOM(this, "tr")
      for (let x = 0; x < tds.length; x++)
        Text.bloom(new DOM(tr, { ...this.containerOptionFunc(x, this.ySize), tag: "th" }), tds[x])
    }
    return this
  }
}