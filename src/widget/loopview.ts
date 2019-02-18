import { Box, BoxOption, Seed } from "../core/dom";
import { Store, HasStoreValueWidgetInterface } from "../core/store"

export class ThreeLoopView extends Box implements HasStoreValueWidgetInterface<number> {
  private count = new Store<number>(0)
  private $count = 0
  assign(dst: Store<number>) {
    this.count.assign(dst)
    return this
  }
  private boxes: Box[] = []
  public readonly tops: BoxOption[] = [{
    scale: 0.15,
    fit: { x: "right", y: "center" },
    zIndex: 1,
    opacity: 1
  }, {
    scale: 0.5,
    fit: { x: "center", y: "center" },
    zIndex: 2,
    opacity: 1
  }, {
    scale: 0.15,
    fit: { x: "left", y: "center" },
    zIndex: 1,
    opacity: 1
  }, {
    scale: 0.1,
    fit: { x: "center", y: "center" },
    zIndex: 0,
    opacity: 0
  },]
  private childrenInitialOption: BoxOption = {}
  constructor(p: Box, option: BoxOption = {}, childrenInitialOption: BoxOption = {}) {
    super(p, {
      padding: p.width * 0.05,
      isScrollable: false,
      ...option
    })
    this.childrenInitialOption = childrenInitialOption;
  }
  add(seed: Seed<Box> | Seed<Box>[]) {
    if (seed instanceof Array) {
      for (let s of seed) this.add(s)
      return this
    }
    let option = this.boxes.length < this.tops.length - 1 ? this.tops[this.boxes.length] : this.tops[this.tops.length - 1]
    let box = new Box(this, {
      height: this.height * 1.8,
      ...option,
      ...this.childrenInitialOption,
    }).repeatAtHover({ top: -0.02, height: 0.98 }, 0.5)
    seed(box)
    this.boxes.push(box)
    return this
  }
  turn(n: number) {
    let pre = this.$count;
    this.$count = (this.$count + n + this.boxes.length) % this.boxes.length;
    if (pre === this.$count) return;
    for (let i = 0; i < this.boxes.length; i++) {
      let index = (i + this.$count) % this.boxes.length
      let preIndex = (i + pre) % this.boxes.length
      if (index >= this.tops.length - 1 && preIndex >= this.tops.length - 1) continue
      let option = index < this.tops.length - 1 ? this.tops[index] : this.tops[this.tops.length - 1]
      this.boxes[i].to(option)
    }
    this.count.set(this.$count)
    return this
  }
}
