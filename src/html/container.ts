import { Box, BoxOption, DOM, Seed } from "../core/dom";
import { TextSeed, Text } from "./text";
export interface FlexBoxOption extends BoxOption {
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse"
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse"
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline"
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  alignContent?: "stretch" | "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  // 子要素には order / flex-grow / flex-shrink / flex-basis / align-self があるが
}


// Boot Strap Grid(12)System
export class BSGridBox extends Box {
  constructor(parent: Box, option: BoxOption) {
    super(parent, option)
    this.$dom.classList.add("container")

  }
  //   addForm(seed: BSSeed) {
  //     bloomBSSeed(seed, this);
  //     return this
  //   }
  //   add(seed: BSSeed[]) {
  //     let row = new DOM(this, { class: "row" })
  //     return this
  //   }
  //   add(seed: ((p: DOM) => any)[], size: (number | "" | "auto")[] = []) {
  //     let row = new DOM(this, { class: "row" })
  //     for (let s of seed) seed(row)
  //     for (let i = 0; i < row.children.length; i++) {
  //       let colClass = i < size.length && size[i] !== "" ? `col-${size[i]}` : "col";
  //       row.childr
  //     }
  //   }
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
type ContainerOptionFunc = ((x: number, y: number) => BoxOption)
export class Table extends Box {
  private ySize: number = 0;
  private containerOptionFunc: ContainerOptionFunc
  constructor(parent: Box, option: TableOption = {}, containerOptionFunc: ContainerOptionFunc = (x, y) => ({})) {
    // サイズが変わる？
    // super(new Container(parent, option), { ...option, tag: "table" })
    super(parent, { ...option, tag: "table" })
    this.applyStyle({ "table-layout": "fixed" })
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
