import { Box, BoxOption, Seed } from "../core/dom";
import { Store, HasStoreValueWidgetInterface } from "../core/store"

export class ThreeLoopView extends Box implements HasStoreValueWidgetInterface<number> {
  value = new Store<number>(0)
  private $count = 0
  assign(dst: Store<number>) {
    this.value.assign(dst)
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
      scale: 0.5,
      x: -this.width * 0.3,
      y: -this.height * 0.5,
      zIndex: 1,
    }, {
      scale: 1.0,
      fit: { x: "center", y: "center" },
      zIndex: 2,
    }, {
      scale: 0.5,
      x: this.width * 0.3,
      y: -this.height * 0.5,
      zIndex: 1,
    }, {
      scale: 0.2,
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
      width: this.width * 0.38,
      height: this.height * 0.76,
      ...option,
      ...this.childrenInitialOption,
      isScrollable: true,
    }).toRelativeOnHover({ scale: 1.02, rotate: 5 }, 0.5)
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
    this.value.set(this.$count)
    return this
  }
}
