import { Box, BoxOption, DOM, DOMOption } from "../dom";
import { Text, TextSeed } from "./text"
import { Store, HasStoreValueWidgetInterface } from "../store"
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
export class Input extends DOM implements HasStoreValueWidgetInterface<string> {
  private value: Store<string>
  public readonly $dom: HTMLInputElement
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
    this.value = new Store("")
    this.value.regist(r => this.$dom.setAttribute("value", r))
    this.$dom.addEventListener("change", () => {
      this.value.set(this.$dom.value)
    })
    this.$dom.addEventListener("keyup", () => {
      this.value.set(this.$dom.value)
    })
    this.applyInputOption({ ...inputOption })
  }
  public assign(dst: Store<string>) {
    this.value.assign(dst)
    return this
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

export interface FormOption {
  // TODO: with submit(button?)
  action?: string
  method?: "get" | "post"
  "accept-charset"?: string
  enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain"
  name?: string
  target?: "_blank" | "_self" | "_parent" | "_top" | string
}
export class Form extends Box {
  constructor(parent: Box, formOption: FormOption = {}, containerOption: BoxOption = {}) {
    super(parent, { tag: "form", ...containerOption })
    this.setAttributes(formOption)
  }
}
export class FieldSet extends Box {
  // 間に fieldset / legend[] を生やす
  constructor(parent: Box, option: BoxOption = {}, legend: TextSeed) {
    super(parent, { ...option, tag: "fieldset" })
    Text.bloom(new DOM(this, "legend"), legend)
  }
}
