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
  public readonly tops: BoxOption[];
  private childrenInitialOption: BoxOption = {}
  constructor(p: Box, option: BoxOption = {}, childrenInitialOption: BoxOption = {}) {
    super(p, {
      isScrollable: false,
      ...option
    })
    this.tops = [{
      scale: 0.3,
      x: -this.width * 0.3,
      y: -this.height * 0.5,
      zIndex: 1,
    }, {
      scale: 0.5,
      fit: { x: "center", y: "center" },
      zIndex: 2,
    }, {
      scale: 0.3,
      x: this.width * 0.3,
      y: -this.height * 0.5,
      zIndex: 1,
    }, {
      scale: 0.1,
      fit: { x: "center", y: "center" },
      zIndex: 0,
    },]
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
      isScrollable: true,
    }).repeatAtHover({ scale: 0.95, rotate: 10 }, 0.5)
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
      this.boxes[i].to(option, 0.5)
    }
    this.count.set(this.$count)
    return this
  }
}
