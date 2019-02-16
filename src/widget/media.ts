import { DOM, DOMOption, ContainerOption, Container } from "../dom";
import { Root, MayRoot, assign } from "../root";
// MEDIA :: audio / img / video
export class ProgressBar extends DOM {
  public readonly $dom: HTMLProgressElement
  constructor(parent: DOM, progress: MayRoot<number>, option: DOMOption = {}, max: number = 1) {
    super(parent, { ...option, tag: "progress" })
    assign(progress, x => this.$dom.value = x)
    this.$dom.max = max;
  }
}
export interface MeterBarOption extends DOMOption {
  min?: number,
  max?: number,
  low?: number,
  high?: number,
  optimum?: number
}
export class MeterBar extends DOM {
  public readonly $dom: HTMLMeterElement
  constructor(parent: DOM, value: MayRoot<number>, option: MeterBarOption = {}) {
    super(parent, { ...option, tag: "meter" })
    assign(value, x => this.$dom.value = x)
    if (option.min) this.$dom.min = option.min
    if (option.max) this.$dom.max = option.max
    if (option.low) this.$dom.low = option.low
    if (option.high) this.$dom.high = option.high
    if (option.optimum) this.$dom.optimum = option.optimum
  }
}
export interface IFrameOption extends ContainerOption { src: string }
export class IFrame extends DOM {
  public readonly $dom: HTMLIFrameElement
  constructor(parent: Container, option: IFrameOption) {
    super(parent, { ...option, tag: "iframe" })
    let parsed = this.parseContainerOption(parent, option)
    this.$dom.src = parsed.src;
    this.$dom.width = parsed.width;
    this.$dom.height = parsed.height;
    delete this.$dom.style["width"]
    delete this.$dom.style["height"]
  }
}
export interface ImageOption extends ContainerOption { src: string }
export class Image extends DOM {
  public readonly $dom: HTMLIFrameElement
  constructor(parent: Container, option: ImageOption) {
    // illegal size!
    super(parent, { ...option, tag: "iframe" })
    let parsed = this.parseContainerOption(parent, option)
    this.$dom.src = parsed.src;
    this.$dom.width = parsed.width;
    this.$dom.height = parsed.height;
    delete this.$dom.style["width"]
    delete this.$dom.style["height"]
  }
}