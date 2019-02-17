import * as CSS from "./style";
import { Color, ColorScheme, LinearGradient } from "./color";
import { World, Container, Box, BoxOption, Seed, SeedWithOption, ContainerOption } from "./dom";
import { Text, TextSequence, FixedSizeText } from "./widget/text";
import { Input } from "./widget/input"
import { FlexBox, Table } from "./widget/container"
import { Root, DataStore, Updator } from "./root"
import { KeyBoard } from "./keyboard"
import { ProgressBar, MeterBar, IFrame, Image } from "./widget/media";
import { FAIcon } from "./widget/external"

// fun  : scene(destroy?) / effect / move
// ext  : vividjs / katex / markdown / live2d / graph(tree/chart) / svgjs / code
//      : tips / bootstrap / vue.js / react.js / jquery / niconicocomment
// bug  : media(image size bug(反映の形式を考慮))
//      : {scale / width / height } tree - flow
//      : colorScheme / table はみだし
// impl : webgl(?) / canvas / drag and drop / a-href
//      : colorSchemeLib
//      : isButtonを hover 時におこなう関数に変えたい. + click  +hover
//      : worldにて、width に自動で(scaleが)フィットしてheightが無限大(になりうる)モードがあるとゲーム以外にも使える？

namespace WorldExample {
  // 中に要素を入れる場合はどんな形であれ Containerでないとだめ
  class ThreeLoopView extends Container {
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
    constructor(parent: Container, option: ContainerOption = {}) { super(parent, option) }
    add(seed: SeedWithOption<Box, BoxOption>) {
      let option = this.boxes.length < 3 ? this.topThree[this.boxes.length] : this.topThree[3]
      this.boxes.push(seed(this, option))
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
    }
  }
  function createElem1(parent: Container, option: BoxOption, store: DataStore): Box {
    return new FlexBox(parent, {
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
  function createElem2(parent: Container, option: BoxOption, store: DataStore): Box {
    return new Container(parent, {
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
  function createElem3(parent: Container, option: BoxOption, store: DataStore): Box {
    return new Table(parent, {
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
  function createElem4(parent: Container, option: BoxOption, store: DataStore): Box {
    let clickCount = 0;
    return new Container(parent, {
      ...option,
      fit: { y: "bottom", x: "center" },
      height: parent.height * 0.2,
      colorScheme: new ColorScheme("#fce", "#034"),
      isScrollable: true
    }).tree(p => {
      new ProgressBar(p, store.posX, {}, 100)
      new Text(p, store.posX.to(x => x + "%"))
      new MeterBar(p, store.posX, { min: 0, max: 100, low: 22, high: 66, optimum: 80 })
      new IFrame(p, {
        src: "https://www.openstreetmap.org/export/embed.html",
        width: p.width * 0.7, fit: { y: "top", x: "right" },
      }).repeat({ duration: 1 }, { width: p.width * 0.8, fit: { y: "top", x: "right" } });
    }).on("click", function () {
      clickCount++;
      if (clickCount % 2 === 1)
        this
          .to({
            fit: { x: "right", y: "center" },
          }, 0.5)
          .next({ fit: { x: "right", y: "top" } }, 0.5)
          .next({
            colorScheme: "#000-#fff" // WARN:
          }, 1)
      if (clickCount % 2 === 0)
        this.to({ fit: { x: "right", y: "bottom" } }, 1)
    })
  }
  function threeBoxWorld() {
    let store: DataStore = {
      sec: Root.perFrame(10),
      pressedKey: new Root(""),
      posX: new Root(0),
      inputted: new Root(""),
    }
    let world = new World()
    let loopView = new ThreeLoopView(world, { height: world.height * 0.7 })
    loopView.add((p, o) => createElem3(p, o, store))
    loopView.add((p, o) => createElem2(p, o, store))
    loopView.add((p, o) => createElem1(p, o, store))
    loopView.add((p, o) => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg", ...o }))
    loopView.add((p, o) => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg", ...o }))
    loopView.add((p, o) => new Image(p, { src: "https://sagisawa.0am.jp/me.jpg", ...o }))
    let bottom = createElem4(world, {}, store)
    KeyBoard.onKeyDown(key => {
      store.pressedKey.set(key)
      if (key === "ArrowRight") {
        store.posX.set((x: number) => x + 1)
        loopView.turn(1)
      } else if (key === "ArrowLeft") {
        store.posX.set((x: number) => x - 1)
        loopView.turn(-1)
      }
    })
  }
  threeBoxWorld();
}
