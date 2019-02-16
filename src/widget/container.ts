import { Box, BoxOption } from "../dom";
export class FlexBox extends Box {
  constructor(parent: Box, option: BoxOption) {
    super(parent, option)
    this.applyStyle({
      display: "inline-flex",
      flex: { direction: "column" },
      alignItems: "center"
    })
  }
}
export class Table extends Box {

}