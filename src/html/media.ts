import { DOM, DOMOption, BoxOption, Box, FitWidthDOM, FitWidthDOMOption } from "../core/dom";
import { Store, MayStore, assign } from "../core/store";
// # Box でないサイズのもの
// ゲーム画面なので,通常は固定サイズのboxに中身があるべきという考えを採用.
// - DOM(!Box) -> DOM(!BOX) ... な階層はそもそも深くてよくないし.
// - Text / Button / Input / Progress / Badge / Spinner
// Button / input の中に 例えばspinnerなどを入れたい可能性もある.
// Boot Strap Grid(12)System ? or 自分で置く ?


// MEDIA :: audio / img / video
export class ProgressBar extends FitWidthDOM {
  public readonly $dom: HTMLProgressElement
  constructor(parent: Box, progress: MayStore<number>, option: FitWidthDOMOption = {}, max: number = 1) {
    super(parent, { ...option, tag: "progress", class: ["progress-bar"] })
    this.$dom.setAttribute("role", "progressbar")
    assign(progress, x => this.$dom.value = x)
    this.$dom.max = max;
  }
}

interface SpinnerOption extends DOMOption {
  type?: "border" | "grow"
}
export class Spinner extends DOM {
  constructor(parent: DOM, option: SpinnerOption = {}) {
    super(parent, option)
    this.$dom.classList.add(`spinner-${option.type === "grow" ? "grow" : "border"}`)
  }
}


// TODO: MeterBar is now progress bar!!
export interface MeterBarOption extends DOMOption {
  min?: number,
  max?: number,
  low?: number,
  high?: number,
  optimum?: number
}
export class MeterBar extends DOM {
  public readonly $dom: HTMLMeterElement
  constructor(parent: DOM, value: MayStore<number>, option: MeterBarOption = {}) {
    super(parent, { ...option, tag: "meter" })
    assign(value, x => this.$dom.value = x)
    if (option.min) this.$dom.min = option.min
    if (option.max) this.$dom.max = option.max
    if (option.low) this.$dom.low = option.low
    if (option.high) this.$dom.high = option.high
    if (option.optimum) this.$dom.optimum = option.optimum
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
