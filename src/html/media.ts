import { DOM, DOMOption, BoxOption, Box, FitWidthDOM, FitWidthDOMOption } from "../core/dom";
import { Store, MayStore, assign } from "../core/store";
import { ColorScheme } from "../core/color";
// # Box でないサイズのもの
// ゲーム画面なので,通常は固定サイズのboxに中身があるべきという考えを採用.
// - DOM(!Box) -> DOM(!BOX) ... な階層はそもそも深くてよくないし.
// - Text / Button / Input / Progress / Badge / Spinner
// Boxとちがって,FitWidthDOMは親がBoxの場合にWidthをFitするかしないかを選べるだけである.
// そしてそういうDOMは多い.いわば中間の存在.さらにBoxとちがって,floatしないメリットが有る
// Button / input の中に 例えばspinnerなどを入れたい可能性もある.
// Boot Strap Grid(12)System ? or 自分で置く ?


// MEDIA :: audio / img / video

export interface ProgressBarOption extends FitWidthDOMOption {
  // Box と違って float しない.
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
    assign(progress, x => {
      this.$dom.style.width = `${x}%`
      this.$dom.setAttribute("aria-value-now", "" + x)
      if (option.withLabel) this.$dom.innerText = x + "%";
    })
    this.$dom.setAttribute("aria-value-min", "0")
    this.$dom.setAttribute("aria-value-max", "" + max);
    if (option.colorScheme) {
      let c = ColorScheme.parseToColorScheme(option.colorScheme)
      parent.$dom.style.backgroundColor = c.baseColor.toCSS()
      this.$dom.style.backgroundColor = c.mainColor.toCSS()
      this.$dom.style.color = c.accentColor.toCSS()
    }
  }
}

export interface IFrameOption extends BoxOption { src: string }
export class IFrame extends Box {
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
export class Image extends Box {
  public readonly $dom: HTMLImageElement
  constructor(parent: Box, option: ImageOption) {
    super(parent, { ...option, tag: "img", applyWidthHeightOnlyForAttributes: true })
    this.$dom.src = option.src;
  }
}
