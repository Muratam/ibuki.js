import * as CSS from "./style";
import { Color, ColorScheme } from "./color";
import { Box, BoxOption, SeedWithOption, Ibuki, Scene } from "./dom";
import { Text, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { toStore } from "./store"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import { FAIcon } from "./widget/external"
import { type } from "os";
// fun  : effect / move parent
//      : big input / progress bar
// ext  : vividjs / katex / markdown / live2d / graph(tree/chart) / svgjs / code
//      : tips / bootstrap / vue.js / react.js / jquery / niconicocomment
// bug  : media(image size bug(style/attrs))
//      : animation size bug
//      : table はみだし
//      : repeatAnimation :: 相対的な位置 / 色 ... etc　を変えるためのもので相対値とする
//      : -> top / left / scale / ... は変更しない
//      : -> to / next はもっと絶対的に遷移する.
// impl : webgl(?) / canvas / drag and drop / a-href
//      : colorSchemeLib
//      : isButtonを hover 時におこなう関数に変えたい. + click  +hover
//      : worldにて、width に自動で(scaleが)フィットしてheightが無限大(になりうる)モードがあるとゲーム以外にも使える？
//      : Scene<T extends DataStore> / input-assign

class ThreeLoopView extends Box {
  private count = 0
  private boxes: Box[] = []
  public readonly topThree: BoxOption[] = [{
    scale: 0.2,
    fit: { x: "right", y: "center" },
    zIndex: 1
  }, {
    scale: 0.5,
    fit: { x: "center", y: "center" },
    zIndex: 2
  }, {
    scale: 0.2,
    fit: { x: "left", y: "center" },
    zIndex: 1
  }, {
    scale: 0.1,
    fit: { x: "center", y: "center" },
    zIndex: 0
  },]
  constructor(p: Box, option: BoxOption = {}) { super(p, option) }
  add(seed: SeedWithOption<Box, BoxOption> | SeedWithOption<Box, BoxOption>[]) {
    if (seed instanceof Array) {
      for (let s of seed) this.add(s)
      return this
    }
    let option = this.boxes.length < 3 ? this.topThree[this.boxes.length] : this.topThree[3]
    this.boxes.push(seed(this, option))
    return this
  }
  turn(n: number) {
    let pre = this.count;
    this.count = (this.count + n + this.boxes.length) % this.boxes.length;
    if (pre === this.count) return;
    for (let i = 0; i < this.boxes.length; i++) {
      let index = (i + this.count) % this.boxes.length
      let option = index < 3 ? this.topThree[index] : this.topThree[3]
      this.boxes[i].to(option)
    }
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
  function createElem1(p: Box, option: BoxOption): Box {
    return new FlexBox(p, {
      ...option,
      flexDirection: "column",
      alignItems: "flex-start",
      colorScheme: new ColorScheme("#fce", "#034"),
      isButton: true,
      fontSize: 100,
      isScrollable: true
    }).tree(p => {
      new Input(p, { type: "text", size: 10, label: p2 => new FixedSizeText(p2, "name : ", p.width * 0.5, 20) }).assign(store.inputted)
      new Input(p, { type: "select", options: ["C#", "C++", "js"], label: p2 => new FixedSizeText(p2, "language : ", p.width * 0.5, 20) })
      new Input(p, { type: "checkbox", label: p2 => new FixedSizeText(p2, store.inputted.to(t => t + "yade"), p.width * 0.5, 20) })
    });
  }
  function createElem2(p: Box, option: BoxOption): Box {
    return new Box(p, {
      // border: { width: 10 },
      ...option,
      colorScheme: new ColorScheme("#fce", "#876"),
      fontSize: 100,
      textAlign: "center",
      isScrollable: true,
      draggable: true,
    }).tree(p =>
      new TextSequence(p, [
        ["int main(){\n", { fontName: "Menlo" }],
        [store.sec.to(x => x + "\n"), "#0fb"],
        ["  return;\n", "#ff0"],
        p => new FAIcon(p, "faIgloo", { size: 100, color: Color.parse("#fab") }),
        [store.pressedKey, "#000"],
      ])
    )
  }
  function createElem3(p: Box, option: BoxOption): Box {
    return new Table(p, {
      ...option,
      colorScheme: new ColorScheme("#fce", "#034"),
      fontSize: 100,
      isScrollable: true,
    }, (x, y) => {
      if (y % 2 === 0) return { colorScheme: new ColorScheme("#fce", "#034") }
      return { colorScheme: new ColorScheme("#fce", "#034") }
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
      colorScheme: new ColorScheme("#fce", "#034"),
      isScrollable: true
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
    })
  }

  let loopView = new ThreeLoopView(scene, { height: scene.height * 0.7 }).add([
    createElem3, createElem2, createElem1,
    (p, o) => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg", ...o }),
    (p, o) => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg", ...o }),
    (p, o) => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg", ...o }),
    (p, o) => new IFrame(p, { src: "https://www.openstreetmap.org/export/embed.html", ...o, }),
    (p, o) => new IFrame(p, {
      src: "https://www.openstreetmap.org/export/embed.html",
      width: p.width * 0.7,
      ...o,
    })
  ])
  scene.on("keydownall", key => {
    store.pressedKey.set(key)
    if (key === "ArrowRight") {
      store.posX.set((x: number) => x + 1)
      loopView.turn(1)
    } else if (key === "ArrowLeft") {
      store.posX.set((x: number) => x - 1)
      loopView.turn(-1)
    } else if (key === "d") {
      scene.destroy()
    }
  })
  let bottom = createElem4(scene, {})
  //.repeat({ duration: 1 }, { width: p.width * 0.8 })) // TODO: BUG

}
let ibuki = new Ibuki().play(threeBoxSampleScene)
