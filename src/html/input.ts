import { Box, BoxOption, FitWidthDOM, FitWidthDOMOption, DOM, DOMOption } from "../core/dom";
import { Text, TextSeed } from "./text"
import { Store, HasStoreValueWidgetInterface } from "../core/store"
import { ColorScheme, Color } from "../core/color";
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
  list?: string[] | string // string[] の時は datalist が生えるし,そうでない時はlistにidをいれるとそれを参照できる
  label?: TextSeed// 間にlabelを生やす
  prependLabel?: TextSeed
  valid?: Store<boolean>
}
export class Input extends FitWidthDOM implements HasStoreValueWidgetInterface<string> {
  value: Store<string>
  public readonly $dom: HTMLInputElement
  constructor(parent: DOM, inputAttributeOption: InputOption = {}, domOption: FitWidthDOMOption = {}) {
    let isSmallInputType = ["checkbox", "radio"].some(x => x === inputAttributeOption.type)
    let formGroup = new FitWidthDOM(parent, {
      class: ["form-group", isSmallInputType ? "form-check" : ""],
      dontFitWidth: domOption.dontFitWidth
    })
    let label: DOM = undefined
    function createLabel(flag: boolean) {
      if (!inputAttributeOption.label) return;
      label = new DOM(formGroup, "label")
      Text.bloom(label, inputAttributeOption.label)
    }
    if (!isSmallInputType) createLabel(false)
    if (inputAttributeOption.prependLabel) {
      formGroup = new FitWidthDOM(formGroup, {
        class: "input-group",
        dontFitWidth: domOption.dontFitWidth
      })
      let prependLabel = new DOM(formGroup, { class: "input-group-prepend" })
      let labelContent = Text.bloom(prependLabel, inputAttributeOption.prependLabel)
      labelContent.$dom.classList.add("input-group-text")
      let c = ColorScheme.parseToColorScheme(domOption.colorScheme).addColor(Color.sub("#080808"))
      labelContent.applyStyle(labelContent.parseDOMOption({ colorScheme: c }))
    }
    let option = {
      tag: "input",
      class: isSmallInputType ? "form-check-input" : "form-control",
      type: "text",
      ...domOption
    }
    if (inputAttributeOption.type === "textarea") {
      option.tag = "textarea"
      super(formGroup, option);
    } else if (inputAttributeOption.type === "select") {
      option.tag = "select"
      super(formGroup, option);
      if (inputAttributeOption.options instanceof Array) {
        for (let option of inputAttributeOption.options)
          new DOM(this, "option").$dom.innerText = option
      } else {
        for (let optionKey in inputAttributeOption.options) {
          let optgroup = new DOM(this, "optgroup").setAttributes({ label: optionKey })
          for (let option of inputAttributeOption.options[optionKey])
            new DOM(optgroup, "option").$dom.innerText = option
        }
      }
    } else super(formGroup, option);
    if (isSmallInputType) createLabel(false)
    if (label !== undefined) label.$dom.setAttribute("for", this.$dom.id)
    if (inputAttributeOption.valid) {
      inputAttributeOption.valid.regist(x => {
        let now = "is-valid"
        let not = "is-invalid"
        if (!x) [now, not] = [not, now]
        this.$dom.classList.add(now);
        this.$dom.classList.remove(not);
      })
    }
    this.value = new Store(inputAttributeOption.value || "")
    this.value.regist(r => this.$dom.setAttribute("value", r))
    this.$dom.addEventListener("change", () => {
      if (this.$dom.type === "checkbox") this.value.set(this.$dom.checked + "")
      else this.value.set(this.$dom.value)
    })
    this.$dom.addEventListener("keyup", () => {
      this.value.set(this.$dom.value)
    })
    this.applyInputOption(inputAttributeOption)
  }
  public assign(dst: Store<string>) {
    this.value.set(dst.notLinkCreatedRawValue)
    this.value.assign(dst)
    return this
  }
  private applyInputOption(option: InputOption) {
    option = { ...option }
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
/*
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
*/
