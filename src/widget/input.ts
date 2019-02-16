import { Box, BoxOption, DOM, HasValueWidgetInterface, DOMOption } from "../dom";
import { Text, TextSeed } from "./text"
export type InputType =
  "password" | "search" | "text" | "textarea" | "select" |
  "date" | "email" | "tel" | "time" | "url" | "checkbox" | "radio" |
  "number" | "file" | "range" | "color" | "hidden"
export interface InputOption extends DOMOption {
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
  label?: TextSeed// 間にlabelを生やす
}
export class Input extends DOM implements HasValueWidgetInterface {
  set value(val: string) { this.$dom.setAttribute("value", val) }
  get value(): string { return this.$dom.getAttribute("value") }
  // private $value: { get: () => string, set: (val: string) => void }
  constructor(parent: DOM, inputOption: InputOption = {}) {
    if (inputOption.label) {
      parent = new DOM(parent, "label");
      Text.bloom(parent, inputOption.label)
    }
    if (inputOption.type === "textarea") super(parent, "textarea");
    else if (inputOption.type === "select") {
      super(parent, "select");
      if (inputOption.options instanceof Array) {
        for (let option of inputOption.options)
          new DOM(this, "option").$dom.innerText = option
      } else {
        for (let optionKey in inputOption.options) {
          let optgroup = new DOM(this, "optgroup").setAttributes({ label: optionKey })
          for (let option of inputOption.options[optionKey])
            new DOM(optgroup, "option").$dom.innerText = option
        }
      }
    } else super(parent, "input");
    this.applyInputOption({ ...inputOption })
  }
  private applyInputOption(option: InputOption) {
    if (typeof option.autocomplete === "boolean")
      option.autocomplete = option.autocomplete ? "on" : "off"
    if (option.list && typeof option.list !== "string") {
      let datalist = new DOM(this.$parent, "datalist")
      option.list.map((x: string) => new DOM(datalist, "option").setAttributes({ value: x }))
      option.list = datalist.id
    }
    delete option.label
    delete option.options
    this.setAttributes(option);
  }
}

export interface FormOption extends BoxOption {
  // TODO: with submit(button?)
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
  constructor(parent: Box, boxOption: BoxOption = {}, legend: TextSeed) {
    super(parent, { ...boxOption, tag: "fieldset" })
    Text.bloom(new DOM(this, "legend"), legend)
  }
}
