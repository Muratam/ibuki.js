import { DOM, DOMOption, BoxOption, Box } from "../core/dom";
import { Store, MayStore, assign } from "../core/store";
// MEDIA :: audio / img / video
export class ProgressBar extends DOM {
  public readonly $dom: HTMLProgressElement
  constructor(parent: Box, progress: MayStore<number>, option: DOMOption = {}, max: number = 1) {
    super(parent, { ...option, tag: "progress", class: ["progress-bar"] })
    this.$dom.setAttribute("role", "progressbar")
    this.fitWidth(parent)
    assign(progress, x => this.$dom.value = x)
    this.$dom.max = max;
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
  constructor(parent: Box, value: MayStore<number>, option: MeterBarOption = {}) {
    super(parent, { ...option, tag: "meter" })
    this.fitWidth(parent)
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