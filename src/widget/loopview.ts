import { Box, BoxOption } from "../core/dom";
import { Store, HasStoreValue } from "../core/store"
import * as CSS from "../core/style"
export class ThreeLoopView extends Box implements HasStoreValue<number> {
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
      filter: new CSS.Filter({
        blur: 5,
        dropShadow: { x: 5, y: 5, blur: 10, color: "gray" },
      }),
      fit: { x: "left", y: "center" },
      zIndex: 100,
      state: "back"
    }, {
      scale: 1.0,
      fit: { x: "center", y: "center" },
      filter: new CSS.Filter({
        blur: 0,
        dropShadow: { x: 5, y: 5, blur: 10, color: "gray" }
      }),
      zIndex: 200,
      state: "fore"
    }, {
      scale: 0.5,
      fit: { x: "right", y: "center" },
      filter: new CSS.Filter({
        blur: 5,
        dropShadow: { x: 5, y: 5, blur: 10, color: "gray" },
      }),
      zIndex: 100,
      state: "back"
    }, {
      scale: 0.2,
      fit: { x: "center", y: "center" },
      filter: new CSS.Filter({
        blur: 5,
        dropShadow: { x: 5, y: 5, blur: 10, color: "gray" },
      }),
      zIndex: 0,
      state: "back"
    },]
    this.childrenInitialOption = childrenInitialOption;
  }
  add(seed: ((p: Box) => Box) | ((p: Box) => Box)[]): this {
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
    }).toRelativeOnHover({ scale: 1.02, rotate: 0.1 }, { duration: 0.5 }, "fore")
    seed(box)
    this.boxes.push(box)
    return this
  }
  turn(n: number): this {
    let pre = this.$count;
    this.$count = (this.$count + n + this.boxes.length) % this.boxes.length;
    if (pre === this.$count) return this;
    for (let i = 0; i < this.boxes.length; i++) {
      let index = (i + this.$count) % this.boxes.length
      let preIndex = (i + pre) % this.boxes.length
      if (index >= this.tops.length - 1 && preIndex >= this.tops.length - 1) continue
      let option = index < this.tops.length - 1 ? this.tops[index] : this.tops[this.tops.length - 1]
      if (index === 1) this.boxes[i].state = "fore"
      this.boxes[i].to(option, { duration: 0.5 })
    }
    this.value.set(this.$count)
    return this
  }
}
