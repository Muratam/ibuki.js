import { Color } from "../color";
import { Box, BoxOption, World, iota } from "../dom";
export type InputType =
  "password" | "search" | "text" | "textarea" |
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
}
export class InputBox extends Box {
  constructor(parent: Box, inputOption: InputOption = {}, boxOption: BoxOption = {}) {
    super(parent, {
      tag: inputOption.type === "textarea" ? "textarea" : "input",
      ...boxOption
    });
    if (typeof inputOption.autocomplete === "boolean")
      inputOption.autocomplete = inputOption.autocomplete ? "on" : "off"
    this.setAttributes(inputOption);
  }
}

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

// new World().tree(() => {
//   iota(10).map((x: number) => {
//   })
//   new Form(this).tree(() => {
//     new InputBox(this)
//   })
// })
// [select] -> option[value,selected,label,disabled] / optgroup
// [input list="aaa"] / [aaa]
// label progress meter fieldset legend
// export type SelectType = "datalist" | "select" | "label"
// export class SelectBox extends Box { }
// MEDIA :: audio / img / video / iframe