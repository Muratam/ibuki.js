import { Box, FitBox, BoxOption, DOM, TextSeed, Text } from "../core/dom";
export interface FlexBoxOption extends BoxOption {
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline"
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  alignContent?: "stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  // 子要素には order / flex-grow / flex-shrink / flex-basis / align-self があるが
}

export class FlexBox extends FitBox {
  constructor(parent: Box, option: FlexBoxOption = {}) {
    super(parent, option)
    this.applyStyle({ display: "flex" })
  }
  static column(parent: Box, option: FlexBoxOption = {}): FlexBox {
    return new FlexBox(parent, {
      flexDirection: "column",
      alignItems: "flex-start",
      ...option
    })
  }
}
export interface TableOption extends BoxOption {
  widthes?: number[]
  caption?: TextSeed
  captionSide?: "top" | "bottom" | "left" | "right"
  borderSpacing?: number
  borderCollapse?: "collapse" | "separate"
}
type ContainerOptionFunc = ((x: number, y: number) => BoxOption)
export class Table extends FitBox {
  private ySize: number = 0;
  private containerOptionFunc: ContainerOptionFunc
  constructor(parent: Box, option: TableOption = {}, containerOptionFunc: ContainerOptionFunc = (x, y) => ({})) {
    // サイズが変わる？
    // super(new Container(parent, option), { ...option, tag: "table" })
    super(parent, { ...option, tag: "table" })
    this.applyStyle({ "table-layout": "fixed" })
    this.containerOptionFunc = containerOptionFunc;
    if (option.caption) this.bloom(option.caption)
  }
  addHeader(header: TextSeed[]): Table {
    if (header.length === 0) return this;
    let tr = new DOM(this, "tr")
    for (let x = 0; x < header.length; x++)
      new DOM(tr, { ...this.containerOptionFunc(x, 0), tag: "th" }).bloom(header[x])
    return this;
  }
  addContents(contents: TextSeed[][]): Table {
    if (contents.length === 0) return this;
    for (let tds of contents) {
      this.ySize++;
      let tr = new DOM(this, "tr")
      for (let x = 0; x < tds.length; x++)
        new DOM(tr, { ...this.containerOptionFunc(x, this.ySize), tag: "th" }).bloom(tds[x])
    }
    return this
  }
}
