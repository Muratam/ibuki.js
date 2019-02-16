import { Color } from "../color";
import { Box, BoxOption, World, iota } from "../dom";
export type InputType =
  "password" | "search" | "text" | "textarea" | "select" |
  "date" | "email" | "tel" | "time" | "url" | "checkbox" | "radio" |
  "number" | "file" | "range" | "color" | "hidden"
export interface InputOption {
  type?: InputType
  name?: string // checkbox / radio では同じ名前にすると共有
  size?: number
  maxlength?: number
  placeholder?: string
  pattern?: string
  max?: number
  min?: number
  step?: number
  value?: string
  autocomplete?: boolean | "on" | "off"
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  autofocus?: boolean
  multiple?: boolean
  checked?: boolean
  // file
  accept?: "audio/*" | "video/*" | "image/*" | "text/*" | "application/*" | string[]
  // textarea
  rows?: number
  cols?: number
  wrap?: "soft" | "hard"
  // select
  options?: string[] | { [key: string]: string[] }
  // custom
  list?: string[] | string // string[] の時は datalist が生える
  label?: string | ((parent: Box) => Box)// 間にlabelを生やす
}
export class InputBox extends Box {
  constructor(parent: Box, inputOption: InputOption = {}, boxOption: BoxOption = {}) {
    function tagged(tag: string): BoxOption { return ({ tag: tag, ...boxOption }); }
    if (inputOption.label) {
      let label = new Box(parent, { tag: "label" });
      if (typeof inputOption.label === "string")
        label.$dom.innerText = inputOption.label
      else inputOption.label(label)
      parent = label
    }
    if (inputOption.type === "textarea") {
      super(parent, tagged("textarea"));
    } else if (inputOption.type === "select") {
      super(parent, tagged("select"));
      if (inputOption.options instanceof Array) {
        for (let option of inputOption.options)
          new Box(this, { tag: "option" }).$dom.innerText = option
      } else {
        for (let optionKey in inputOption.options) {
          let optgroup = new Box(this, { tag: "optgroup" }, { label: optionKey })
          for (let option of inputOption.options[optionKey])
            new Box(optgroup, { tag: "option" }).$dom.innerText = option
        }
      }
    } else super(parent, tagged("input"));
    this.applyInputOption({ ...inputOption })
  }
  private applyInputOption(option: InputOption) {
    if (typeof option.autocomplete === "boolean")
      option.autocomplete = option.autocomplete ? "on" : "off"
    if (option.list && typeof option.list !== "string") {
      let datalist = new Box(this.$parent, { tag: "datalist" })
      option.list.map((x: string) => new Box(datalist, { tag: "option" }, { value: x }))
      option.list = datalist.id
    }
    delete option.label
    delete option.options
    this.setAttributes(option);
  }
}
// [select] -> option[value,selected,label,disabled] / optgroup

export interface FormOption {
  // with submit(button?)
  action?: string
  method?: "get" | "post"
  "accept-charset"?: string
  enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
  name?: string
  target?: "_blank" | "_self" | "_parent" | "_top" | string
}
export class Form extends Box {
  constructor(parent: Box, formOption: FormOption = {}, boxOption: BoxOption = {}) {
    super(parent, { tag: "form", ...boxOption })
    this.setAttributes(formOption)
  }
}
export class FieldSet extends Box {
  // 間に fieldset / legend[] を生やす
  constructor(parent: Box, boxOption: BoxOption = {}, legend: string | ((parent: Box) => Box) = "") {
    super(parent, { tag: "fieldset" }, boxOption)
    let legendBox = new Box(this, { tag: "legend" })
    if (typeof legend === "string") legendBox.$dom.innerText = legend
    else legend(legendBox)
  }
}
// MEDIA :: audio / img / video / iframe / progress / meter /
