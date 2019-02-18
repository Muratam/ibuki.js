import { Color, ColorScheme } from "../core/color";
import { Box, BoxOption, Scene } from "../core/dom";
import { Text, TextSequence, FixedSizeText } from "../html/text";
import { Input } from "../html/input"
import { FlexBox, Table } from "../html/container"
import { toStore, DataStore } from "../core/store"
import { ProgressBar, MeterBar, IFrame, Image } from "../html/media";
import { FAIcon } from "../widget/external/faicon"
import { ThreeLoopView } from "../widget/loopview"



export function threeBoxSampleScene(scene: Scene, store: DataStore) {
  store.sec = scene.perFrame(10)
  function createElem1(p: Box): Box {
    return new FlexBox(p, {
      flexDirection: "column",
      alignItems: "flex-start",
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
    height: scene.height * 0.7,
    isScrollable: true,
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
    let last = ""
    for (let k in key) last = k
    if (last !== "") store.pressedKey.set(last)
    if (key.d) {
      scene.destroy();
      scene.gotoNextScene(scene => threeBoxSampleScene(scene, store))
      return;
    }
    if (wait > 0) return;
    if (key.ArrowRight) {
      store.posX.set((x: number) => x + 1)
      loopView.turn(1)
      wait = 40
    } else if (key.ArrowLeft) {
      store.posX.set((x: number) => x - 1)
      loopView.turn(-1)
      wait = 40
    }
  })
  let bottom = createElem4(back, {
    colorScheme: new ColorScheme("#444", "#cdf", "#89d"),
  })
  //.repeatAtHover({ top: -0.1, height: 0.9 }, 0.5).repeat({ scale: 0.9 }, {}, 1)
}
export let threeLoopViewStore = {
  inputted: toStore(""),
  sec: toStore(0),
  pressedKey: toStore(""),
  posX: toStore(0)
}

// try
// new World().play(scene => threeBoxSampleScene(scene, threeLoopViewStore))
