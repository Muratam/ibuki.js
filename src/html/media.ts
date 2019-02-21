import { DOM, BoxOption, FitBox, Box, FitWidthDOM, FitWidthDOMOption } from "../core/dom";
import { Store, MayStore } from "../core/store";
import { ColorScheme } from "../core/color";
// MEDIA :: audio / img / video
export interface ProgressBarOption extends FitWidthDOMOption {
  height?: number
  withLabel?: boolean
  striped?: boolean
}
export class ProgressBar extends FitWidthDOM {
  constructor(parent: DOM, progress: MayStore<number>, option: ProgressBarOption = {}, max: number = 1) {
    let parentOption: ProgressBarOption = {
      tag: "div",
      class: "progress",
      dontFitWidth: option.dontFitWidth,
    }
    if (typeof option.height === "number") parentOption.height = option.height
    parent = new FitWidthDOM(parent, parentOption)
    let classes = ["progress-bar"]
    if (option.striped) classes = classes.concat(["progress-bar-striped", "progress-bar-animated"])
    super(parent, { ...option, tag: "div", class: classes })
    this.$dom.setAttribute("role", "progressbar")
    Store.regist(progress, x => {
      this.$dom.style.width = `${x}%`
      this.$dom.setAttribute("aria-value-now", "" + x)
      if (option.withLabel) this.$dom.innerText = x + "%";
    })
    this.$dom.setAttribute("aria-value-min", "0")
    this.$dom.setAttribute("aria-value-max", "" + max);
    if (option.colorScheme) {
      let c = new ColorScheme(option.colorScheme)
      parent.$dom.style.backgroundColor = c.baseColor.toCSS()
      this.$dom.style.backgroundColor = c.mainColor.toCSS()
      this.$dom.style.color = c.accentColor.toCSS()
    }
  }
}

export interface IFrameOption extends BoxOption { src: string }
export class IFrame extends FitBox {
  public readonly $dom: HTMLIFrameElement
  constructor(parent: Box, option: IFrameOption) {
    super(parent, { ...option, tag: "iframe" })
    this.$dom.src = option.src;
  }
}
export interface ImageOption extends BoxOption {
  src: string
  forceSize?: boolean
}
export class Image extends FitBox {
  public readonly $dom: HTMLImageElement
  constructor(parent: Box, option: ImageOption) {
    super(parent, { ...option, tag: "img" })
    this.$dom.src = option.src;
  }
}
