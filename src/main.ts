import * as CSS from "./style";
import { Color, ColorScheme } from "./color";
import { Box, BoxOption, Seed, Ibuki, Scene } from "./dom";
import { Text, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { toStore, Store, HasStoreValueWidgetInterface, assign } from "./store"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import { FAIcon } from "./widget/external"
// todo : 間にBoxを挟むと悪くない感じに動いてくれるが,遅い...(でも後に回したいから放置)
//      : animation と transition が競合した場合,不整合なことが起きるかもしれない(けどそこまで変わらないといえば変わらない)
// fun  : effect
//      : big inputbox(selectbox) / progress bar
// ext  : vividjs / katex / markdown / live2d / graph(tree/chart) / svgjs / code
//      : tips / bootstrap / vue.js / react.js / jquery / niconicocomment
// bug  : media(image size bug(style/attrs)) / rotation bug / resize bug
// impl : webgl(?) / canvas / drag and drop / a-href
//      : colorSchemeLib
//      : isButtonを hover 時におこなう関数に変えたい. + click  +hover
//      : worldにて、width に自動で(scaleが)フィットしてheightが無限大(になりうる)モードがあるとゲーム以外にも使える？
//      : Scene<T extends DataStore> / input-assign


//      : 全て transformで行う

class ThreeLoopView extends Box implements HasStoreValueWidgetInterface<number> {
  private count = new Store<number>(0)
  private $count = 0
  assign(dst: Store<number>) {
    this.count.assign(dst)
    return this
  }
  private boxes: Box[] = []
  public readonly tops: BoxOption[] = [{
    scale: 0.2,
    fit: { x: "right", y: "center" },
    zIndex: 1,
    opacity: 1
  }, {
    scale: 0.5,
    fit: { x: "center", y: "center" },
    zIndex: 2,
    opacity: 1
  }, {
    scale: 0.2,
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
    super(p, option)
    this.childrenInitialOption = childrenInitialOption;
  }
  add(seed: Seed<Box> | Seed<Box>[]) {
    if (seed instanceof Array) {
      for (let s of seed) this.add(s)
      return this
    }
    let option = this.boxes.length < this.tops.length - 1 ? this.tops[this.boxes.length] : this.tops[this.tops.length - 1]
    // let box = seed(this).applyOption({ ...option, ...this.childrenInitialOption })
    let box = new Box(this, { ...option, ...this.childrenInitialOption, height: this.height * 1.8 })
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
      // this.boxes[i].to({ ...option, ...this.childrenInitialOption })
      this.boxes[i].to(option)
    }
    this.count.set(this.$count)
    return this
  }
}

function threeBoxSampleScene(scene: Scene) {
  let store = {
    inputted: toStore(""),
    sec: scene.perFrame(10),
    pressedKey: toStore(""),
    posX: toStore(0)
  }
  function createElem1(p: Box): Box {
    return new FlexBox(p, {
      flexDirection: "column",
      alignItems: "flex-start",
      isButton: true,
    }).tree(p => {
      new Input(p, { type: "text", size: 10, label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.5, 20) }).assign(store.inputted)
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.5, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.inputted.to(t => t + "yade"), p.width * 0.5, 20) })
    });
  }
  function createElem2(p: Box): Box {
    return new Box(p, {
      textAlign: "center",
      draggable: true,
    }).tree(p =>
      new TextSequence(p, [
        ["int main(){\n", { fontName: "Menlo" }],
        [store.sec.to(x => x + "\n"), "#0fb"],
        ["  return;\n", "#ff0"],
        p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
        [store.pressedKey, "#000"],
      ])
    ) // .to({ colorScheme: new ColorScheme("#000") }, 10)
  }
  function createElem3(p: Box): Box {
    return new Table(p, {}, (x, y) => {
      if (y % 2 === 0) return { colorScheme: new ColorScheme("#fce", "#034") }
      return {}
    }).addContents([
      ["iikanji", store.inputted, "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", p => new FAIcon(p, "faIgloo", {}), "year"],
      ["iikanji", store.inputted, "year"],
    ])
  }
  function createElem4(p: Box, option: BoxOption): Box {
    let clickCount = 0;
    return new Box(p, {
      ...option,
      fit: { y: "bottom", x: "center" },
      height: p.height * 0.2,
    }).tree(p => {
      new ProgressBar(p, store.posX, {}, 100)
      new Text(p, store.posX.to(x => x + "%"))
      new MeterBar(p, store.posX, { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
    }).on("click", function () {
      clickCount++;
      if (clickCount % 2 === 1)
        this
          .to({
            fit: { x: "left", y: "center" },
          }, 0.5)
          .next({ fit: { x: "left", y: "top" } }, 0.5)
          .next({
            colorScheme: new ColorScheme("#000", "#fff", "#888")
          }, 1)
      if (clickCount % 2 === 0)
        this.to({ fit: { x: "left", y: "bottom" } }, 1)
    }).update(function () { })
  }
  let back = new Box(scene, {
    colorScheme: new ColorScheme("#555")
  })
  let loopView = new ThreeLoopView(back, {
    height: scene.height * 0.7
  }, {
      colorScheme: new ColorScheme("#222", "#cdf", "#89d"),
      border: { width: 20, style: "solid", radius: 30 },
      fontSize: 100,
      padding: 30,
      isScrollable: true,
    }).add([
      createElem3, createElem2, createElem1,
      p => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg" }),
      p => new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html" }),
      p => new IFrame(p, {
        src: "https://www.openstreetmap.org/export/embed.html",
        width: p.width * 0.7,
      })
    ])
  let wait = 0
  scene.update(() => { wait--; })
  scene.on("keydownall", key => {
    store.pressedKey.set(key)
    if (key === "d") { scene.destroy(); scene.gotoNextScene(threeBoxSampleScene) }
    if (wait > 0) return;
    if (key === "ArrowRight") {
      store.posX.set((x: number) => x + 1)
      loopView.turn(1)
      wait = 40
    } else if (key === "ArrowLeft") {
      store.posX.set((x: number) => x - 1)
      loopView.turn(-1)
      wait = 40
    }
  })
  let bottom = createElem4(back, {
    colorScheme: new ColorScheme("#444", "#cdf", "#89d"),
  }).repeat({ duration: 1 }, { width: scene.width * 0.8, left: scene.width * 0.1 })

}
let ibuki = new Ibuki().play(threeBoxSampleScene)
/*scene => {
  console.log(3)
  new Box(scene, {
    top: scene.height * 0.2,
    height: scene.height * 0.3,
    width: scene.width * 0.5,
    colorScheme: new ColorScheme("#fab", "red", "black")
  }).tree(p => {
    new Box(p, {
      top: p.height * 0.2,
      height: p.height * 0.3,
      width: p.width * 0.5,
      colorScheme: new ColorScheme("#000", "000", "000")
    })
  })
})
:*/